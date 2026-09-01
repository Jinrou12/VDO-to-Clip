import sys
import json
import whisper

# Fix Windows console unicode printing
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import os

# ១. ដាក់ឈ្មោះ File វីដេអូ ឬ សំឡេងរបស់អ្នកនៅទីនេះ
AUDIO_OR_VIDEO_FILE = "dharma_talk.mp4"

# Check if target file exists, or find any mp4/wav file in directory
if not os.path.exists(AUDIO_OR_VIDEO_FILE):
    media_files = [f for f in os.listdir('.') if f.lower().endswith(('.mp4', '.mp3', '.wav', '.m4a', '.mkv', '.webm'))]
    if media_files:
        AUDIO_OR_VIDEO_FILE = media_files[0]
        print(f"ℹ️ រកឃើញ File: '{AUDIO_OR_VIDEO_FILE}' សម្រាប់ប្រើប្រាស់!")
    else:
        print(f"❌ Error: រកមិនឃើញ File '{AUDIO_OR_VIDEO_FILE}' ក្នុង Folder នេះទេ។")
        print("👉 សូម Copy File វីដេអូ ឬ សំឡេង ដាក់ចូលក្នុង Folder នេះ រួចប្តូរឈ្មោះជា 'dharma_talk.mp4'!")
        sys.exit(1)

import shutil
import subprocess
import imageio_ffmpeg

# Fix Windows ffmpeg executable path so Whisper internal load_audio finds ffmpeg.exe
try:
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    target_dir = os.path.dirname(exe)
    ffmpeg_alias = os.path.join(target_dir, 'ffmpeg.exe')
    if not os.path.exists(ffmpeg_alias):
        shutil.copyfile(exe, ffmpeg_alias)
    os.environ['PATH'] += os.path.pathsep + target_dir
except Exception as err:
    print(f"ℹ️ FFmpeg path setup notice: {err}")

try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    ffmpeg_exe = "ffmpeg"

# Extract clean 16kHz WAV audio first to save memory and avoid OutOfMemory crash on 3GB+ video files
temp_audio_file = "temp_whisper_audio.wav"
print(f"🎙️ កំពុងទាញយកសំឡេងពី {AUDIO_OR_VIDEO_FILE} ទៅជា WAV...")
cmd = [
    ffmpeg_exe, "-y",
    "-i", AUDIO_OR_VIDEO_FILE,
    "-vn",
    "-acodec", "pcm_s16le",
    "-ar", "16000",
    "-ac", "1",
    temp_audio_file
]
subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

target_audio = temp_audio_file if os.path.exists(temp_audio_file) else AUDIO_OR_VIDEO_FILE

print("🗣️ កំពុងស្តាប់ និងបំប្លែងសំឡេងជាអត្ថបទ (Transcribing with Whisper)...")
# ប្រើ in_memory=False ដើម្បីការពារ MemoryError លើ RAM CPU
try:
    model = whisper.load_model("large-v3", in_memory=False)
except Exception as e:
    print(f"ℹ️ Falling back to 'small' model: {e}")
    model = whisper.load_model("small", in_memory=False)

# ដាក់ prompt ជំនួយពាក្យធម៌
prompt_khmer = (
    "ធម្មទេសនា ព្រះធម៌ ព្រះសង្ឃ អរិយសច្ច កម្មផល សីល សមាធិ បញ្ញា បុណ្យផ្កាប្រាក់"
)
result = model.transcribe(
    target_audio, language="km", initial_prompt=prompt_khmer
)

# Clean up temp wav
if os.path.exists(temp_audio_file):
    os.remove(temp_audio_file)

# ២. រៀបចំទុកតែ Timestamp និង អត្ថបទ
transcript_data = []
for seg in result["segments"]:
    transcript_data.append(
        {
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"].strip(),
        }
    )

# ៣. Save ចេញជា File JSON
with open("transcript.json", "w", encoding="utf-8") as f:
    json.dump(transcript_data, f, ensure_ascii=False, indent=2)

print("ទាញយក Transcript រួចរាល់! File ត្រូវបានរក្សាទុកជា 'transcript.json'")
