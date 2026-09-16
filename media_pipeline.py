import os
import json
import shutil
import subprocess
import tempfile
from typing import List, Dict, Any, Optional, Tuple

from security import validate_safe_path, mask_secret

# Cached FFmpeg binary path
_RESOLVED_FFMPEG: Optional[str] = None


def get_ffmpeg_cmd() -> str:
    """Resolves and returns the absolute path to a functional FFmpeg executable."""
    global _RESOLVED_FFMPEG
    if _RESOLVED_FFMPEG and os.path.exists(_RESOLVED_FFMPEG):
        return _RESOLVED_FFMPEG

    # 1. Try imageio_ffmpeg
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and os.path.exists(exe):
            _RESOLVED_FFMPEG = exe
            return exe
    except Exception:
        pass

    # 2. Try shutil.which("ffmpeg")
    which_exe = shutil.which("ffmpeg")
    if which_exe and os.path.exists(which_exe):
        _RESOLVED_FFMPEG = which_exe
        return which_exe

    # 3. Default fallback
    _RESOLVED_FFMPEG = "ffmpeg"
    return "ffmpeg"


def check_ffmpeg_status() -> Dict[str, Any]:
    """Inspects FFmpeg availability, executable path, and version."""
    exe = get_ffmpeg_cmd()
    try:
        proc = subprocess.run(
            [exe, "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5
        )
        if proc.returncode == 0:
            first_line = proc.stdout.decode("utf-8", errors="replace").splitlines()[0]
            return {
                "available": True,
                "executable": exe,
                "version": first_line,
                "error": None
            }
        else:
            return {
                "available": False,
                "executable": exe,
                "version": None,
                "error": f"Process exited with code {proc.returncode}"
            }
    except Exception as e:
        return {
            "available": False,
            "executable": exe,
            "version": None,
            "error": mask_secret(str(e))
        }


def probe_media(filepath: str) -> Dict[str, Any]:
    """
    Probes video/audio media using FFmpeg to verify duration,
    presence of audio stream, and basic metadata.
    Raises ValueError or FileNotFoundError if invalid.
    """
    safe_path = validate_safe_path(filepath, must_exist=True)
    exe = get_ffmpeg_cmd()

    try:
        cmd = [exe, "-hide_banner", "-i", safe_path]
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=15
        )
        output = proc.stderr.decode("utf-8", errors="replace")
    except Exception as e:
        raise ValueError(f"FFmpeg execution failed: {mask_secret(str(e))}")

    # Check for duration
    import re
    dur_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.?\d*)", output)
    if not dur_match:
        raise ValueError("Could not determine media duration. File may be corrupted or invalid.")

    hours = float(dur_match.group(1))
    minutes = float(dur_match.group(2))
    seconds = float(dur_match.group(3))
    total_duration = hours * 3600 + minutes * 60 + seconds

    if total_duration <= 0.1:
        raise ValueError("Media duration is too short (< 0.1s) or empty.")

    # Check for audio stream
    has_audio = bool(re.search(r"Stream #\d+:\d+.*Audio:", output, re.IGNORECASE))
    has_video = bool(re.search(r"Stream #\d+:\d+.*Video:", output, re.IGNORECASE))

    if not has_audio:
        raise ValueError("No audio stream detected in media file.")

    return {
        "filepath": safe_path,
        "duration": round(total_duration, 2),
        "has_audio": has_audio,
        "has_video": has_video,
    }


def extract_speech_audio(video_path: str, output_path: str) -> str:
    """
    Extracts speech-optimized mono audio (16kHz 64kbps MP3) from media file.
    Writes atomically to output_path.
    """
    safe_in = validate_safe_path(video_path, must_exist=True)
    exe = get_ffmpeg_cmd()

    out_dir = os.path.dirname(os.path.abspath(output_path))
    os.makedirs(out_dir, exist_ok=True)

    # Use a temporary file for atomic creation
    temp_fd, temp_path = tempfile.mkstemp(suffix=".mp3", dir=out_dir)
    os.close(temp_fd)

    try:
        cmd = [
            exe, "-y",
            "-i", safe_in,
            "-vn",
            "-acodec", "libmp3lame",
            "-ar", "16000",
            "-ac", "1",
            "-b:a", "64k",
            temp_path
        ]
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=300
        )
        if proc.returncode != 0:
            err_msg = proc.stderr.decode("utf-8", errors="replace")[:300]
            raise RuntimeError(f"FFmpeg audio extraction failed: {mask_secret(err_msg)}")

        if not os.path.exists(temp_path) or os.path.getsize(temp_path) < 100:
            raise RuntimeError("Extracted audio file is missing or empty.")

        # Atomic move to target output path
        if os.path.exists(output_path):
            os.remove(output_path)
        shutil.move(temp_path, output_path)
        return output_path

    except Exception:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        raise


def compute_audio_chunks(
    total_duration: float,
    max_chunk_sec: float = 600.0,
    overlap_sec: float = 4.0
) -> List[Dict[str, float]]:
    """
    Divides audio of length total_duration into overlapping chunks.
    Each chunk has 3-5 seconds overlap with previous chunk to preserve speech across boundaries.
    """
    if total_duration <= max_chunk_sec:
        return [{
            "chunk_idx": 1,
            "start": 0.0,
            "end": round(total_duration, 2),
            "offset": 0.0,
            "duration": round(total_duration, 2)
        }]

    chunks = []
    current_start = 0.0
    idx = 1

    while current_start < total_duration:
        chunk_start = max(0.0, current_start - (overlap_sec if idx > 1 else 0.0))
        chunk_end = min(total_duration, current_start + max_chunk_sec)
        chunk_dur = round(chunk_end - chunk_start, 2)

        chunks.append({
            "chunk_idx": idx,
            "start": round(chunk_start, 2),
            "end": round(chunk_end, 2),
            "offset": round(chunk_start, 2),
            "duration": chunk_dur
        })

        idx += 1
        current_start += max_chunk_sec

    return chunks


def merge_overlapping_segments(
    segments: List[Dict[str, Any]],
    overlap_window_sec: float = 4.0
) -> List[Dict[str, Any]]:
    """
    Sorts transcription segments by start timestamp and eliminates duplicate
    phrases across chunk boundaries caused by chunk overlap.
    """
    if not segments:
        return []

    # Sort strictly by start time
    sorted_segs = sorted(segments, key=lambda s: (s.get("start", 0.0), s.get("end", 0.0)))
    merged: List[Dict[str, Any]] = []

    for seg in sorted_segs:
        text = str(seg.get("text", "")).strip()
        if not text:
            continue

        start = round(float(seg.get("start", 0.0)), 2)
        end = round(float(seg.get("end", start + 0.5)), 2)

        if not merged:
            merged.append({**seg, "start": start, "end": end, "text": text})
            continue

        prev = merged[-1]
        prev_text = str(prev.get("text", "")).strip()
        prev_end = float(prev.get("end", 0.0))

        # Check for boundary overlap
        if start < prev_end:
            # 1. Exact or identical text duplication in overlap window
            if text == prev_text:
                # Merge end times
                prev["end"] = max(prev_end, end)
                continue

            # 2. Textual overlap: if current text is prefix/suffix of previous
            if text in prev_text:
                prev["end"] = max(prev_end, end)
                continue
            if prev_text in text:
                prev["text"] = text
                prev["end"] = max(prev_end, end)
                continue

            # 3. Sub-phrase overlap (words at end of prev match start of curr)
            prev_words = prev_text.split()
            curr_words = text.split()
            overlap_found = False

            for n in range(min(5, len(prev_words), len(curr_words)), 0, -1):
                if prev_words[-n:] == curr_words[:n]:
                    # Overlapping words detected! Drop duplicated prefix from current segment
                    deduped_words = curr_words[n:]
                    if deduped_words:
                        new_text = " ".join(deduped_words)
                        merged.append({
                            **seg,
                            "start": max(prev_end, start),
                            "end": max(prev_end + 0.5, end),
                            "text": new_text
                        })
                    overlap_found = True
                    break

            if overlap_found:
                continue

            # 4. If timestamps overlap but text is distinct, clamp current start to prev_end
            start = prev_end

        if end <= start:
            end = start + 0.5

        merged.append({
            **seg,
            "start": start,
            "end": end,
            "text": text
        })

    return merged


def atomic_write_json(filepath: str, data: Any):
    """Writes JSON data atomically using a temporary file and atomic replace."""
    target_dir = os.path.dirname(os.path.abspath(filepath))
    os.makedirs(target_dir, exist_ok=True)
    temp_fd, temp_path = tempfile.mkstemp(suffix=".json", dir=target_dir)
    try:
        with os.fdopen(temp_fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        # Atomic replace
        if os.path.exists(filepath):
            os.replace(temp_path, filepath)
        else:
            shutil.move(temp_path, filepath)
    except Exception:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        raise
