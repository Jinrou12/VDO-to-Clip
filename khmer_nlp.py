import re
import unicodedata
from typing import List, Dict, Any, Optional

# Khmer Unicode Ranges
# Base Consonants: U+1780 - U+17A2
# Independent Vowels: U+17A3 - U+17B3
# Dependent Vowels & Signs: U+17B6 - U+17C5
# Subscript Consonant Sign (Coeng): U+17D2
# Diacritics: U+17C6 - U+17D1, U+17D3 - U+17DC
# Khmer Digits: U+17E0 - U+17E9
# Khmer Symbols / Punctuation: U+17D4, U+17D5, U+17D6, U+17D7, U+17D8, U+17D9, U+17DA

KHMER_COMBINING_MARKS = set(
    chr(cp) for cp in list(range(0x17B6, 0x17D4)) + [0x17DD]
)

# Supported Vocabulary Modes
VOCABULARY_MODES = {
    "modern_conversation": "Natural everyday spoken Khmer. Preserve slang, colloquial particles (ណា, ហ្នឹង, ទេ, ចឹង, ម៉េច), English loanwords, and conversational rhythm.",
    "dhamma_formal": "Formal Buddhist Dhamma teaching. Accurately preserve Pali/Sanskrit terms (ព្រះធម៌, កុសល, អកុសល, សីល, សមាធិ, បញ្ញា, កម្ម, និព្វាន) and respectful monk addressing.",
    "buddhist_terms": "Specialized Buddhist philosophy and Vinaya vocabulary. Ensure Pali terminology and scriptural references are transcribed with Chuon Nath dictionary spelling.",
    "comedy_podcast": "Lighthearted, punchy comedy and podcast conversation. Preserve jokes, spontaneous laughter, colloquial expressions, and informal phrasing.",
    "education": "Educational lecture, science, or how-to explanation. Balance clear Khmer technical vocabulary with natural spoken delivery.",
    "news": "Formal broadcast and news report style. Use formal grammatical structures, standard Chuon Nath orthography, and clear sentence demarcations."
}


def normalize_khmer_unicode(text: str) -> str:
    """
    Normalizes Khmer Unicode text:
    - Applies Unicode NFC (Canonical Composition).
    - Removes zero-width joiners/non-joiners where unneeded while keeping ZWSP (U+200B).
    - Normalizes double vowels or out-of-order combining marks.
    """
    if not text or not isinstance(text, str):
        return ""

    # NFC Normalization
    normalized = unicodedata.normalize("NFC", text)

    # Normalize multiple whitespace while preserving Khmer words
    normalized = re.sub(r"[ \t]+", " ", normalized)
    
    # Fix redundant consecutive coeng signs (U+17D2 + U+17D2 -> U+17D2)
    normalized = re.sub(r"\u17D2\u17D2+", "\u17D2", normalized)

    return normalized.strip()


def is_khmer_combining_char(char: str) -> bool:
    """Returns True if the character is a Khmer dependent vowel, coeng, or diacritic."""
    if not char:
        return False
    return char in KHMER_COMBINING_MARKS or unicodedata.category(char) in ("Mn", "Mc", "Me")


def safe_khmer_slice(text: str, max_chars: int) -> str:
    """
    Safely truncates Khmer text to max_chars without severing
    a combining mark (dependent vowel, coeng subscript) from its base consonant.
    """
    if not text:
        return ""
    if len(text) <= max_chars:
        return text

    # If the cutoff point lands on a combining character, walk backward to the base consonant
    cutoff = max_chars
    while cutoff > 0 and is_khmer_combining_char(text[cutoff]):
        cutoff -= 1

    # Also check if cutoff lands right on Coeng (U+17D2), walk back before Coeng
    if cutoff > 0 and text[cutoff - 1] == "\u17D2":
        cutoff -= 1

    return text[:cutoff].strip()


def wrap_khmer_caption(text: str, max_chars_per_line: int = 38, max_lines: int = 2) -> List[str]:
    """
    Wraps Khmer text into clean lines (default 2 lines for Reels / TikTok captions)
    without splitting combining character clusters.
    Prefers splitting on spaces, punctuation (។, ៕), or zero-width spaces.
    If an unbroken word/token exceeds max_chars_per_line, uses safe_khmer_slice.
    """
    normalized = normalize_khmer_unicode(text)
    if not normalized:
        return []

    # If it already fits on one line
    if len(normalized) <= max_chars_per_line:
        return [normalized]

    # Split into words/tokens based on spaces or Khmer punctuation
    delimiters = r"([ \u200B\u17D4\u17D5])"
    tokens = re.split(delimiters, normalized)

    lines: List[str] = []
    current_line = ""

    for token in tokens:
        if not token:
            continue

        # If a single token is longer than max_chars_per_line (unbroken Khmer text)
        while len(token) > max_chars_per_line:
            slice_part = safe_khmer_slice(token, max_chars_per_line)
            if not slice_part:
                slice_part = token[:max_chars_per_line]
            lines.append(slice_part.strip())
            token = token[len(slice_part):].lstrip()

        test_line = current_line + token
        if len(test_line) <= max_chars_per_line:
            current_line = test_line
        else:
            if current_line.strip():
                lines.append(current_line.strip())
            current_line = token.lstrip()

    if current_line.strip():
        lines.append(current_line.strip())

    # If lines exceed max_lines, clamp and join overflow cleanly
    if len(lines) > max_lines:
        top_lines = lines[:max_lines - 1]
        remaining = " ".join(lines[max_lines - 1:])
        last_line = safe_khmer_slice(remaining, max_chars_per_line)
        return top_lines + [last_line]

    return lines


def format_khmer_segment(
    raw_text: str,
    start: float,
    end: float,
    vocab_mode: str = "modern_conversation"
) -> Dict[str, Any]:
    """
    Packages a speech segment preserving raw spoken text, normalized text,
    and formatted display text according to the target vocabulary mode.
    """
    clean_raw = str(raw_text).strip()
    norm_text = normalize_khmer_unicode(clean_raw)
    
    return {
        "start": round(start, 2),
        "end": round(end, 2),
        "duration": round(end - start, 2),
        "raw_text": clean_raw,
        "normalized_text": norm_text,
        "display_text": norm_text,
        "vocab_mode": vocab_mode,
        "needs_review": False
    }


def get_vocabulary_prompt_guidance(mode: str) -> str:
    """Returns AI system prompt guidance tailored to the chosen Khmer vocabulary mode."""
    guidance = VOCABULARY_MODES.get(mode, VOCABULARY_MODES["modern_conversation"])
    return f"""
KHMER VOCABULARY MODE: {mode.upper()}
Guidelines:
{guidance}
- Zero-Cutoff Rule: Never cut in the middle of a spoken Khmer phrase or sentence.
- Always preserve Khmer Unicode combining marks (ស្រះ និង ជើង) correctly.
- Do not artificially convert natural colloquial speech into formal text unless in dhamma_formal or news mode.
- Tag any ambiguous or uncertain words with [needs_review: true].
"""
