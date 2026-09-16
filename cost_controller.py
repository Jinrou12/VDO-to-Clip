import os
import json
import hashlib
import time
from typing import Dict, Any, Optional, List, Set

# Allowed free-tier models (no paid charges)
FREE_TIER_MODELS = {
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.0-flash-lite-preview-02-05",
}

PAID_TIER_MODELS = {
    "gemini-1.5-pro",
    "gemini-2.0-pro-exp-02-05",
    "gemini-2.5-pro"
}


class CostController:
    """
    Enforces cost limits, prevents unauthorized paid API usage,
    and manages content-hashed caches to avoid redundant AI calls.
    """
    def __init__(
        self,
        cost_policy: str = "free_only",
        allow_paid_fallback: bool = False,
        max_ai_requests_per_video: int = 25,
        max_scout_candidates: int = 30,
        max_specialist_candidates: int = 8,
        max_daily_budget_usd: float = 0.0,
        cache_dir: str = "cache"
    ):
        self.cost_policy = cost_policy
        self.allow_paid_fallback = allow_paid_fallback
        self.max_ai_requests_per_video = max_ai_requests_per_video
        self.max_scout_candidates = max_scout_candidates
        self.max_specialist_candidates = max_specialist_candidates
        self.max_daily_budget_usd = max_daily_budget_usd
        self.cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), cache_dir)
        os.makedirs(self.cache_dir, exist_ok=True)
        self._request_counts: Dict[str, int] = {}

    def is_model_allowed(self, model_name: str) -> bool:
        """Checks if a model is permitted under current cost policy."""
        norm_name = model_name.lower().strip()
        if self.cost_policy == "free_only":
            return norm_name in FREE_TIER_MODELS
        if not self.allow_paid_fallback and norm_name in PAID_TIER_MODELS:
            return False
        return True

    def filter_allowed_models(self, preferred_models: List[str]) -> List[str]:
        """Filters a candidate model list down to strictly permitted models."""
        allowed = [m for m in preferred_models if self.is_model_allowed(m)]
        if not allowed and self.cost_policy == "free_only":
            return ["gemini-2.0-flash", "gemini-1.5-flash"]
        return allowed

    def track_request(self, video_id: str) -> bool:
        """Tracks requests per video and enforces max_ai_requests_per_video."""
        current = self._request_counts.get(video_id, 0)
        if current >= self.max_ai_requests_per_video:
            raise RuntimeError(
                f"Cost budget exceeded: Reached maximum {self.max_ai_requests_per_video} AI requests for video."
            )
        self._request_counts[video_id] = current + 1
        return True

    @staticmethod
    def compute_file_hash(filepath: str) -> str:
        """Calculates SHA-256 hash of a file's content."""
        hasher = hashlib.sha256()
        with open(filepath, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @staticmethod
    def compute_text_hash(text: str) -> str:
        """Calculates SHA-256 hash of a string."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def get_cached_result(self, cache_type: str, cache_key: str) -> Optional[Any]:
        """Retrieves cached result by key if present."""
        path = os.path.join(self.cache_dir, f"{cache_type}_{cache_key}.json")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def store_cached_result(self, cache_type: str, cache_key: str, data: Any):
        """Stores result into content-hashed cache."""
        path = os.path.join(self.cache_dir, f"{cache_type}_{cache_key}.json")
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception:
            pass


# Global singleton controller
cost_controller = CostController()
