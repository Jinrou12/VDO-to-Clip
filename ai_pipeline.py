import json
import os
import re
from typing import List, Dict, Any, Optional
from google import genai
from pydantic import BaseModel, Field

from job_manager import JobState
from security import validate_safe_path, mask_secret
from media_pipeline import (
    probe_media,
    extract_speech_audio,
    merge_overlapping_segments,
    atomic_write_json
)
from khmer_nlp import (
    normalize_khmer_unicode,
    wrap_khmer_caption,
    get_vocabulary_prompt_guidance
)
from clip_scoring import (
    detect_contextless_opening,
    calculate_meaning_preservation,
    compute_transparent_score,
    adapt_clip_boundary,
    cluster_scout_candidates
)
from cost_controller import cost_controller

# Import essential helper functions from auto_clip_engine
from auto_clip_engine import (
    transcribe_with_gemini_3way,
    get_saved_gemini_key,
    KEY_POOL
)


def run_preflight(video_path: str, manager, job_id: str) -> Dict[str, Any]:
    """Step 1: Validate media, audio streams, and calculate preflight metrics."""
    if manager.is_cancelled(job_id):
        raise RuntimeError("Job cancelled by user during preflight.")

    manager.update_job(job_id, status=JobState.PREPARING, progress=5, message="Running preflight media probe")

    info = probe_media(video_path)
    duration = info["duration"]
    estimated_audio_tokens = int((duration / 60) * 1500)
    print(f"[Preflight] Job {job_id}: Duration {duration}s, Estimated Tokens: {estimated_audio_tokens}")
    return info


def extract_audio_track(video_path: str, manager, job_id: str) -> str:
    """Step 2: Extract speech-optimized mono audio (16kHz)."""
    if manager.is_cancelled(job_id):
        raise RuntimeError("Job cancelled by user before audio extraction.")

    manager.update_job(job_id, status=JobState.EXTRACTING_AUDIO, progress=12, message="Extracting speech audio (16kHz mono)")

    # Store inside audio_cache directory
    cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio_cache")
    os.makedirs(cache_dir, exist_ok=True)
    audio_out = os.path.join(cache_dir, f"audio_{job_id}.mp3")

    if video_path.lower().endswith((".mp3", ".wav")):
        return video_path

    return extract_speech_audio(video_path, audio_out)


def transcribe_audio(
    audio_path: str,
    video_duration: float,
    manager,
    job_id: str,
    vocab_mode: str = "dhamma_formal"
) -> List[Dict[str, Any]]:
    """Step 3: Transcribe using Gemini 3-Way consensus and deduplicate overlap."""
    if manager.is_cancelled(job_id):
        raise RuntimeError("Job cancelled by user before transcription.")

    # Check content-hashed cache
    try:
        audio_hash = cost_controller.compute_file_hash(audio_path)
        cached_transcript = cost_controller.get_cached_result("transcript", audio_hash)
        if cached_transcript:
            print(f"[Cache Hit] Reusing cached transcript for {audio_hash[:10]}...")
            manager.update_job(job_id, status=JobState.NORMALIZING_TRANSCRIPT, progress=55, message="Loaded transcript from cache")
            return cached_transcript
    except Exception:
        audio_hash = None

    manager.update_job(job_id, status=JobState.TRANSCRIBING, progress=20, message="Transcribing (3-Way Consensus)")

    def progress_cb(msg, pct):
        if manager.is_cancelled(job_id):
            raise RuntimeError("Job cancelled by user during transcription.")
        scaled_pct = 20 + int((pct / 100.0) * 30)
        manager.update_job(job_id, progress=scaled_pct, message=msg)

    # Track API call count
    cost_controller.track_request(job_id)

    raw_segments = transcribe_with_gemini_3way(
        audio_path=audio_path,
        video_duration=video_duration,
        progress_callback=progress_cb
    )

    manager.update_job(job_id, status=JobState.NORMALIZING_TRANSCRIPT, progress=52, message="Deduplicating chunk overlaps")
    deduped_segments = merge_overlapping_segments(raw_segments)

    # Normalize Khmer Unicode
    for s in deduped_segments:
        s["text"] = normalize_khmer_unicode(s.get("text", ""))

    # Save to cache if hash computed
    if audio_hash:
        cost_controller.store_cached_result("transcript", audio_hash, deduped_segments)

    return deduped_segments


def normalize_transcript(segments: List[Dict[str, Any]]) -> str:
    """Normalizes segments into clean timestamped transcript blocks for LLM analysis."""
    lines = []
    for s in segments:
        text = str(s.get("text", "")).strip()
        if text:
            lines.append(f"[{s.get('start', 0.0):.1f}s - {s.get('end', 0.0):.1f}s]: {text}")
    return "\n".join(lines)


def scout_candidates(
    transcript_text: str,
    duration: float,
    manager,
    job_id: str,
    vocab_mode: str = "dhamma_formal"
) -> List[Dict[str, Any]]:
    """Step 4: Scout meaningful candidate highlights with cost-controlled models."""
    if manager.is_cancelled(job_id):
        raise RuntimeError("Job cancelled by user before scouting.")

    manager.update_job(job_id, status=JobState.SCOUTING, progress=60, message="Scouting highlights (Free Flash AI)")

    api_key = get_saved_gemini_key()
    if not api_key:
        raise ValueError("No Gemini API key available.")

    # Enforce free-only model list with active working models
    preferred = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"]
    models = cost_controller.filter_allowed_models(preferred)

    guidance = get_vocabulary_prompt_guidance(vocab_mode)
    prompt = f"""You are an expert Khmer Content Scout.
Scan this transcript and detect 8-15 meaningful clips suitable for Reels, TikTok, and YouTube Shorts.
Detect content regardless of duration (jokes, punchlines, life lessons, Dhamma teachings, analogies, emotional moments).

{guidance}

Preferred clip duration: 30-60s. Minimum 15s, Maximum 90s.
Duration of full video: {duration}s.

TRANSCRIPT:
{transcript_text[:35000]}

Return ONLY a valid JSON array matching this exact schema:
[
  {{
    "start": 45.0,
    "end": 95.0,
    "types": ["Dhamma", "Life Lesson"],
    "hook_strength": 0.85,
    "meaning_strength": 0.90,
    "emotion_strength": 0.70,
    "completeness": 0.90,
    "context_required": false,
    "reason": "ពន្យល់អំពីការអត់ធ្មត់"
  }}
]
"""
    client = genai.Client(api_key=api_key)
    result = []

    for m in models:
        if manager.is_cancelled(job_id):
            raise RuntimeError("Job cancelled by user during scouting.")
        try:
            cost_controller.track_request(job_id)
            resp = client.models.generate_content(model=m, contents=prompt)
            raw = resp.text.strip()
            s_idx = raw.find("[")
            e_idx = raw.rfind("]")
            if s_idx != -1 and e_idx > s_idx:
                parsed = json.loads(raw[s_idx:e_idx+1])
                if isinstance(parsed, list) and len(parsed) > 0:
                    result = parsed
                    break
        except Exception as e:
            print(f"[Scout] Model {m} failed: {mask_secret(str(e))}")

    return result


def specialist_review(
    clustered_candidates: List[Dict[str, Any]],
    transcript_text: str,
    segments: List[Dict[str, Any]],
    manager,
    job_id: str,
    vocab_mode: str = "dhamma_formal"
) -> List[Dict[str, Any]]:
    """Step 5: Specialist review with zero cut-off alignment, meaning preservation, and transparent scoring."""
    if manager.is_cancelled(job_id):
        raise RuntimeError("Job cancelled by user before specialist review.")

    manager.update_job(job_id, status=JobState.SPECIALIST_ANALYSIS, progress=78, message="Specialist review & meaning preservation check")

    if not clustered_candidates:
        return []

    # Filter allowed models according to cost policy (using active working models)
    models = cost_controller.filter_allowed_models(["gemini-3.6-flash", "gemini-2.5-flash"])
    api_key = get_saved_gemini_key()
    client = genai.Client(api_key=api_key) if api_key else None

    # Fetch historical user feedback from SQLite to personalize decision making
    few_shots = manager.get_feedback_few_shots(limit=3) if hasattr(manager, "get_feedback_few_shots") else {"accepted": [], "rejected": []}
    memory_guidance = ""
    if few_shots.get("accepted"):
        memory_guidance += "\nEDITOR'S HIGH-RATED APPROVED EXAMPLES (MATCH THIS STYLE):\n"
        for ex in few_shots["accepted"]:
            memory_guidance += f"- Approved: {ex.get('title')} | Hook: {ex.get('hook_text')} (Score: {ex.get('score')})\n"
    if few_shots.get("rejected"):
        memory_guidance += "\nDISCARDED PATTERNS TO AVOID (DO NOT REPEAT):\n"
        for ex in few_shots["rejected"]:
            memory_guidance += f"- Discarded: {ex.get('title')} | Reason: {ex.get('reason')}\n"

    prompt = f"""You are a senior Khmer Dhamma Specialist & Video Editor.
Refine these rough candidate timestamps into standalone, impactful clips.
Zero Cut-off Rule: Ensure clips start and end on natural, complete sentences. Never cut mid-thought.
{memory_guidance}
CANDIDATES:
{json.dumps(clustered_candidates[:8], ensure_ascii=False)}

TRANSCRIPT:
{transcript_text[:35000]}

Return ONLY a valid JSON array:
[
  {{
    "title": "ចំណងជើងជាភាសាខ្មែរ",
    "startTime": 45.0,
    "endTime": 98.0,
    "hook_strength": 0.85,
    "meaning_completeness": 0.90,
    "emotion_or_humor": 0.75,
    "language_quality": 0.85,
    "audience_relevance": 0.80,
    "council_agreement": 0.85,
    "context_required": false,
    "is_misleading": false,
    "rationale": "ហេតុផលសម្រាប់ការកាត់វគ្គនេះ"
  }}
]
"""
    raw_specialist_clips = []
    if client:
        for m in models:
            if manager.is_cancelled(job_id):
                raise RuntimeError("Job cancelled by user during specialist analysis.")
            try:
                cost_controller.track_request(job_id)
                resp = client.models.generate_content(model=m, contents=prompt)
                raw = resp.text.strip()
                s_idx = raw.find("[")
                e_idx = raw.rfind("]")
                if s_idx != -1 and e_idx > s_idx:
                    parsed = json.loads(raw[s_idx:e_idx+1])
                    if isinstance(parsed, list) and len(parsed) > 0:
                        raw_specialist_clips = parsed
                        break
            except Exception as e:
                print(f"[Specialist] Model {m} failed: {mask_secret(str(e))}")

    # Fallback to clustered candidates if AI review failed
    if not raw_specialist_clips:
        for c in clustered_candidates:
            raw_specialist_clips.append({
                "title": c.get("reason", "វគ្គសំខាន់"),
                "startTime": c.get("start", 0.0),
                "endTime": c.get("end", 60.0),
                "hook_strength": c.get("hook_strength", 0.7),
                "meaning_completeness": c.get("completeness", 0.8),
                "emotion_or_humor": c.get("emotion_strength", 0.6),
                "language_quality": 0.8,
                "audience_relevance": 0.75,
                "council_agreement": 0.8,
                "context_required": False,
                "is_misleading": False,
                "rationale": c.get("reason", "")
            })

    manager.update_job(job_id, status=JobState.QUALITY_REVIEW, progress=90, message="Evaluating meaning preservation & safe boundaries")

    final_clips = []
    for idx, clip in enumerate(raw_specialist_clips):
        start = float(clip.get("startTime", clip.get("start", 0.0)))
        end = float(clip.get("endTime", clip.get("end", start + 30.0)))

        # Adaptive boundary alignment
        aligned_start, aligned_end = adapt_clip_boundary(start, end, segments)
        duration = round(aligned_end - aligned_start, 2)

        title = normalize_khmer_unicode(str(clip.get("title", f"Clip {idx+1}")))
        wrapped_headlines = wrap_khmer_caption(title, max_chars_per_line=38, max_lines=2)

        # Meaning preservation score
        meaning_score = calculate_meaning_preservation(
            completeness=float(clip.get("meaning_completeness", 0.8)),
            context_required=bool(clip.get("context_required", False)),
            is_misleading=bool(clip.get("is_misleading", False))
        )

        # Multi-factor transparent score
        transparent_score_data = compute_transparent_score(
            hook_strength=clip.get("hook_strength", 0.7),
            meaning_completeness=clip.get("meaning_completeness", 0.8),
            emotion_or_humor=clip.get("emotion_or_humor", 0.6),
            language_quality=clip.get("language_quality", 0.8),
            audience_relevance=clip.get("audience_relevance", 0.75),
            council_agreement=clip.get("council_agreement", 0.8)
        )

        # Safety gate: flag if meaning preservation < 0.75 or contextless opening
        contextless = detect_contextless_opening(title)
        needs_review = (meaning_score < 0.75) or contextless or clip.get("is_misleading", False)

        final_clips.append({
            "clip_id": f"clip_{job_id[:8]}_{idx+1}",
            "title": title,
            "headline_lines": wrapped_headlines,
            "startTime": aligned_start,
            "endTime": aligned_end,
            "duration": duration,
            "meaning_preservation_score": meaning_score,
            "score": transparent_score_data["final_score"],
            "score_label": transparent_score_data["score_label"],
            "score_breakdown": transparent_score_data["breakdown"],
            "status": "REVIEW_REQUIRED" if needs_review else "APPROVED",
            "needs_review": needs_review,
            "rationale": clip.get("rationale", "")
        })

    return final_clips


def run_discovery_pipeline(job_id: str, video_path: str, manager):
    """
    Main entry point for staged AI processing pipeline.
    Full persistence, checkpointing, cancellation, and atomic artifact storage.
    """
    try:
        # Step 1: Preflight
        preflight_info = run_preflight(video_path, manager, job_id)
        duration = preflight_info["duration"]

        # Step 2: Audio Extraction
        audio_path = extract_audio_track(video_path, manager, job_id)

        # Step 3: Transcription & Overlap Deduplication
        segments = transcribe_audio(audio_path, duration, manager, job_id)
        transcript_text = normalize_transcript(segments)

        # Step 4: Scout Highlights
        raw_candidates = scout_candidates(transcript_text, duration, manager, job_id)

        # Step 5: Candidate Clustering
        manager.update_job(job_id, status=JobState.CLUSTERING, progress=72, message="Clustering candidate timestamps")
        clustered = cluster_scout_candidates(raw_candidates, merge_gap_sec=15.0)

        # Step 6 & 7: Specialist Review & Quality Review
        final_clips = specialist_review(clustered, transcript_text, segments, manager, job_id)

        # Step 8: Atomic Output Storage
        out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output_clips")
        os.makedirs(out_dir, exist_ok=True)
        out_json = os.path.join(out_dir, f"results_{job_id}.json")
        atomic_write_json(out_json, final_clips)

        manager.update_job(
            job_id,
            status=JobState.COMPLETED,
            progress=100,
            message=f"Generated {len(final_clips)} clips successfully",
            result_data={"clips": final_clips, "file": out_json}
        )

    except RuntimeError as re_err:
        if "cancelled" in str(re_err).lower():
            manager.update_job(job_id, status=JobState.CANCELLED, message="Processing cancelled by user")
        else:
            import traceback
            manager.update_job(job_id, status=JobState.FAILED_RETRYABLE, message=mask_secret(str(re_err)), error_log=mask_secret(traceback.format_exc()))
    except Exception as e:
        import traceback
        err_msg = mask_secret(str(e))
        err_trace = mask_secret(traceback.format_exc())
        manager.update_job(
            job_id,
            status=JobState.FAILED_RETRYABLE,
            message=f"Pipeline error: {err_msg}",
            error_log=err_trace
        )
