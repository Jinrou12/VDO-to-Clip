import os
import sys
import json
import time
import shutil

# Ensure UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Ensure ffmpeg.exe is in PATH for Whisper
try:
    import imageio_ffmpeg
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    target_dir = os.path.dirname(exe)
    alias = os.path.join(target_dir, 'ffmpeg.exe')
    if not os.path.exists(alias):
        shutil.copyfile(exe, alias)
    os.environ['PATH'] = target_dir + os.pathsep + os.environ.get('PATH', '')
    print("✅ FFmpeg configured:", exe)
except Exception as e:
    print("FFmpeg setup warning:", e)

audio_path = "temp_audio.wav"
if not os.path.exists(audio_path):
    print("Extracting audio from dharma_talk.mp4.mp4...")
    import subprocess
    subprocess.run([
        'ffmpeg', '-y', '-i', 'dharma_talk.mp4.mp4',
        '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', audio_path
    ], check=True)

import whisper

print("🚀 Loading Whisper model 'small' for Khmer speech recognition...")
t0 = time.time()
try:
    model = whisper.load_model("small")
except Exception as e:
    print(f"Fallback to base model: {e}")
    model = whisper.load_model("base")

print(f"✅ Model loaded in {time.time()-t0:.2f}s")
print("🎙️ Transcribing Khmer audio (53 minutes)... Starting now:")

prompt_khmer = "ធម្មទេសនា ព្រះធម៌ ព្រះសង្ឃ អរិយសច្ច កម្មផល សីល សមាធិ បញ្ញា បុណ្យផ្កាប្រាក់ សាមគ្គី"
result = model.transcribe(
    audio_path,
    language="km",
    initial_prompt=prompt_khmer,
    fp16=False,
    verbose=True
)

segments = result.get("segments", [])
print(f"\n✅ Whisper transcription completed! Total segments: {len(segments)}")

numbered_lines = []
transcript_json = []

for idx, seg in enumerate(segments, 1):
    start = seg["start"]
    end = seg["end"]
    text = seg["text"].strip()
    
    start_m, start_s = divmod(int(start), 60)
    end_m, end_s = divmod(int(end), 60)
    time_str = f"{start_m:02d}:{start_s:02d} - {end_m:02d}:{end_s:02d}"
    
    line = f"[{idx}] [{time_str}] {text}"
    numbered_lines.append(line)
    
    transcript_json.append({
        "id": idx,
        "start": round(start, 2),
        "end": round(end, 2),
        "time_str": time_str,
        "text": text
    })

with open("numbered_transcript.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(numbered_lines))

with open("transcript.json", "w", encoding="utf-8") as f:
    json.dump(transcript_json, f, ensure_ascii=False, indent=2)

print(f"🎉 Generated numbered_transcript.txt with {len(numbered_lines)} blocks!")
print(f"🎉 Saved transcript.json successfully!")
