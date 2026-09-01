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

print("កំពុងស្តាប់ និងបំប្លែងសំឡេងជាអត្ថបទ (Transcribing)...")
# ប្រើ large-v3 ដើម្បីចាប់ភាសាខ្មែរបានច្បាស់ល្អ
model = whisper.load_model("large-v3")

# ដាក់ prompt ជំនួយពាក្យធម៌
prompt_khmer = (
    "ធម្មទេសនា ព្រះធម៌ ព្រះសង្ឃ អរិយសច្ច កម្មផល សីល សមាធិ បញ្ញា បុណ្យផ្កាប្រាក់"
)
result = model.transcribe(
    AUDIO_OR_VIDEO_FILE, language="km", initial_prompt=prompt_khmer
)

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
