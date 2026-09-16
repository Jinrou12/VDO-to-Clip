import re
from typing import List, Dict, Any, Optional

# Contextless opening patterns in English and Khmer
CONTEXTLESS_OPENING_PATTERNS = [
    # English
    r"^(he|she|they|it|that|this)\b",
    r"^(it means|that means|meaning that)\b",
    r"^(as i said|as we said|like i mentioned)\b",
    r"^(because|so|therefore|and then)\b",
    # Khmer
    r"^(គាត់|នាង|គេ|វា|នោះ|នេះ|ឯង)\b",
    r"^(មានន័យថា|បានន័យថា|ដូច្នេះហើយ)\b",
    r"^(ដូចដែលបាននិយាយ|ដូចដែលញោមដឹង|ដូចបានលើកឡើង)\b",
    r"^(ពីព្រោះ|ពីព្រោះតែ|ដោយសារ|ហេតុដូច្នេះ)\b",
    r"^(ហើយ|រួចមក|បន្ទាប់មក)\b"
]


def detect_contextless_opening(text: str) -> bool:
    """
    Detects if a clip starts abruptly without necessary context
    (e.g., starts with pronouns or dependent conjunctions).
    """
    if not text or not isinstance(text, str):
        return False
    cleaned = text.strip()
    for pat in CONTEXTLESS_OPENING_PATTERNS:
        if re.search(pat, cleaned, re.IGNORECASE):
            return True
    return False


def calculate_meaning_preservation(
    completeness: float,
    context_required: bool,
    is_misleading: bool = False
) -> float:
    """
    Computes a meaning preservation score:
    - complete: 1.00
    - mostly_complete: 0.75
    - requires_context: 0.50
    - misleading_out_of_context: 0.10
    """
    if is_misleading:
        return 0.10
    if context_required:
        return 0.50
    if completeness >= 0.85:
        return 1.00
    if completeness >= 0.60:
        return 0.75
    return 0.50


def compute_transparent_score(
    hook_strength: float = 0.5,
    meaning_completeness: float = 0.5,
    emotion_or_humor: float = 0.5,
    language_quality: float = 0.5,
    audience_relevance: float = 0.5,
    council_agreement: float = 0.5
) -> Dict[str, Any]:
    """
    Calculates a transparent multi-dimensional quality score:
    final_score =
        0.25 * hook_strength
      + 0.25 * meaning_completeness
      + 0.15 * emotion_or_humor
      + 0.15 * language_quality
      + 0.10 * audience_relevance
      + 0.10 * council_agreement

    Never claims fake probability (e.g. '99.5% viral probability').
    """
    h = max(0.0, min(1.0, float(hook_strength)))
    m = max(0.0, min(1.0, float(meaning_completeness)))
    e = max(0.0, min(1.0, float(emotion_or_humor)))
    l = max(0.0, min(1.0, float(language_quality)))
    a = max(0.0, min(1.0, float(audience_relevance)))
    c = max(0.0, min(1.0, float(council_agreement)))

    final_score = (
        0.25 * h +
        0.25 * m +
        0.15 * e +
        0.15 * l +
        0.10 * a +
        0.10 * c
    )

    return {
        "final_score": round(final_score * 100, 1), # 0 - 100 score
        "breakdown": {
            "hook_strength": round(h, 2),
            "meaning_completeness": round(m, 2),
            "emotion_or_humor": round(e, 2),
            "language_quality": round(l, 2),
            "audience_relevance": round(a, 2),
            "council_agreement": round(c, 2)
        },
        "score_label": (
            "Exceptional" if final_score >= 0.85 else
            "High Quality" if final_score >= 0.70 else
            "Good" if final_score >= 0.50 else
            "Needs Review"
        )
    }


def adapt_clip_boundary(
    start: float,
    end: float,
    transcript_segments: List[Dict[str, Any]],
    preferred_min_dur: float = 15.0,
    preferred_max_dur: float = 90.0,
    pad_start_sec: float = 1.0,
    pad_end_sec: float = 1.5
) -> Tuple_Start_End:
    """
    Aligns candidate start and end timestamps to natural speech segment boundaries.
    Ensures:
    - Never reject a clip simply because it is short (down to 15s).
    - Sentences are not cut off mid-thought.
    - Default maximum duration is respected (default 90s).
    """
    if not transcript_segments:
        return (max(0.0, start - pad_start_sec), end + pad_end_sec)

    # Find the closest segment start at or before the candidate start
    aligned_start = start
    for seg in transcript_segments:
        s_time = float(seg.get("start", 0.0))
        if s_time <= start and (start - s_time) <= 4.0:
            aligned_start = s_time
            break

    # Find closest segment end at or after candidate end
    aligned_end = end
    for seg in reversed(transcript_segments):
        e_time = float(seg.get("end", 0.0))
        if e_time >= end and (e_time - end) <= 5.0:
            aligned_end = e_time
            break

    # Ensure duration is within bounds
    duration = aligned_end - aligned_start
    if duration > preferred_max_dur:
        aligned_end = aligned_start + preferred_max_dur

    return (round(max(0.0, aligned_start), 2), round(aligned_end, 2))


Tuple_Start_End = tuple[float, float]


def cluster_scout_candidates(
    candidates: List[Dict[str, Any]],
    merge_gap_sec: float = 15.0
) -> List[Dict[str, Any]]:
    """
    Clusters candidate timestamps that overlap or are within merge_gap_sec.
    Merges types, reasons, and uncertainties.
    """
    if not candidates:
        return []

    sorted_cands = sorted(candidates, key=lambda c: float(c.get("start", 0.0)))
    clustered = [dict(sorted_cands[0])]

    for curr in sorted_cands[1:]:
        prev = clustered[-1]
        c_start = float(curr.get("start", 0.0))
        c_end = float(curr.get("end", 0.0))
        p_end = float(prev.get("end", 0.0))

        if c_start <= p_end + merge_gap_sec:
            # Merge
            prev["end"] = max(p_end, c_end)
            # Combine types
            prev_types = set(prev.get("types", []))
            prev_types.update(curr.get("types", []))
            prev["types"] = list(prev_types)
            # Combine reasons
            p_reason = prev.get("reason", "")
            c_reason = curr.get("reason", "")
            if c_reason and c_reason not in p_reason:
                prev["reason"] = f"{p_reason} | {c_reason}".strip(" |")
            # Update strength scores to max
            for field in ("hook_strength", "meaning_strength", "emotion_strength", "completeness"):
                prev[field] = max(prev.get(field, 0.5), curr.get(field, 0.5))
        else:
            clustered.append(dict(curr))

    return clustered
