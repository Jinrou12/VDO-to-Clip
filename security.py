import os
import re
import hmac
import secrets
from pathlib import Path
from typing import List, Optional, Set

# Allowed video & audio file extensions
ALLOWED_MEDIA_EXTENSIONS: Set[str] = {
    ".mp4", ".mkv", ".mov", ".avi", ".webm", ".flv", ".ts", ".m4v",
    ".mp3", ".wav", ".m4a", ".aac", ".ogg", ".opus", ".flac"
}

# Forbidden system directory patterns (Windows & POSIX)
FORBIDDEN_SYSTEM_PATHS = [
    r"^[a-zA-Z]:\\windows",
    r"^[a-zA-Z]:\\program files",
    r"^[a-zA-Z]:\\program files \(x86\)",
    r"^[a-zA-Z]:\\system volume information",
    r"^/etc",
    r"^/bin",
    r"^/sbin",
    r"^/usr",
    r"^/var",
    r"^/sys",
    r"^/proc",
]

# Regex pattern to match Gemini API keys and similar secrets
API_KEY_PATTERN = re.compile(r"(AIza[0-9A-Za-z\-_]{30,45})")
BEARER_TOKEN_PATTERN = re.compile(r"(Bearer\s+[A-Za-z0-9\-_\.]{20,})", re.IGNORECASE)


def mask_secret(text: str) -> str:
    """Replaces API keys and tokens in text with safe masked versions."""
    if not isinstance(text, str) or not text:
        return text

    def _replace_key(match):
        key = match.group(1)
        if len(key) > 10:
            return f"{key[:4]}...{key[-4:]}"
        return "[MASKED_KEY]"

    text = API_KEY_PATTERN.sub(_replace_key, text)
    text = BEARER_TOKEN_PATTERN.sub(lambda m: "Bearer [MASKED_TOKEN]", text)
    return text


def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """
    Sanitizes a filename to prevent directory traversal and illegal Windows/POSIX characters.
    Strips directory components and replaces unsafe characters.
    """
    if not filename or not isinstance(filename, str):
        return "unnamed_file"

    # Strip any directory path components
    cleaned = os.path.basename(filename.strip())

    # Replace invalid Windows and Unix filename characters: <>:"/\|?* and control chars
    cleaned = re.sub(r'[\x00-\x1f<>:"/\\|?*]', '_', cleaned)

    # Prevent hidden files or relative path traversal like "." or ".."
    cleaned = cleaned.lstrip(". ")
    if not cleaned:
        cleaned = "unnamed_file"

    return cleaned[:max_length]


def validate_safe_path(
    filepath: str,
    allowed_dirs: Optional[List[str]] = None,
    must_exist: bool = True,
    allowed_extensions: Optional[Set[str]] = None
) -> str:
    """
    Validates that a file path:
    1. Is safe from directory traversal (no '..' attacks).
    2. Is not inside sensitive OS directories (e.g. C:\\Windows, /etc).
    3. Has an allowed media extension (if specified or defaulted to ALLOWED_MEDIA_EXTENSIONS).
    4. Actually exists as a regular file (if must_exist=True).
    Returns the canonical absolute path.
    """
    if not filepath or not isinstance(filepath, str):
        raise ValueError("Invalid file path: path must be a non-empty string.")

    # Reject null bytes
    if "\x00" in filepath:
        raise ValueError("Path traversal attempt detected (null byte).")

    # Reject explicit parent directory traversal tokens before normalization
    normalized_parts = filepath.replace("\\", "/").split("/")
    if ".." in normalized_parts:
        raise ValueError("Directory traversal ('..') is not permitted.")

    try:
        abs_path = os.path.abspath(filepath)
        canonical_path = os.path.realpath(abs_path)
    except Exception as e:
        raise ValueError(f"Could not resolve path: {mask_secret(str(e))}")

    # Check against forbidden system paths
    for pattern in FORBIDDEN_SYSTEM_PATHS:
        if re.search(pattern, canonical_path, re.IGNORECASE):
            raise ValueError(f"Access to system directory is forbidden.")

    # Check allowed directories if provided
    if allowed_dirs:
        matched = False
        for allowed in allowed_dirs:
            try:
                allowed_canonical = os.path.realpath(os.path.abspath(allowed))
                if canonical_path.startswith(allowed_canonical) or canonical_path == allowed_canonical:
                    matched = True
                    break
            except Exception:
                continue
        if not matched:
            raise ValueError("File path is not within the permitted directories.")

    # Extension validation
    exts = allowed_extensions if allowed_extensions is not None else ALLOWED_MEDIA_EXTENSIONS
    if exts:
        ext = os.path.splitext(canonical_path)[1].lower()
        if ext not in exts:
            raise ValueError(f"File extension '{ext}' is not an allowed media format.")

    # Existence check
    if must_exist:
        if not os.path.exists(canonical_path):
            raise FileNotFoundError(f"File does not exist.")
        if not os.path.isfile(canonical_path):
            raise ValueError(f"Target path is a directory or special device, not a regular file.")

    return canonical_path


def safe_delete_temp_file(filepath: str, allowed_dirs: Optional[List[str]] = None) -> bool:
    """
    Safely deletes a temporary file only if it resides within approved temporary directories
    and is not a source code, database, or project critical file.
    """
    if not filepath or not isinstance(filepath, str):
        return False

    try:
        canonical_path = os.path.realpath(os.path.abspath(filepath))
    except Exception:
        return False

    # Never delete code, database, git, or spec files
    protected_exts = {".py", ".ts", ".js", ".db", ".json", ".bat", ".spec", ".md", ".html", ".css", ".env"}
    ext = os.path.splitext(canonical_path)[1].lower()
    if ext in protected_exts and not os.path.basename(canonical_path).startswith("results_job_"):
        return False

    # Default allowed temporary directories
    workspace_root = os.path.realpath(os.path.abspath(os.path.dirname(__file__)))
    default_allowed = [
        os.path.join(workspace_root, "audio_cache"),
        os.path.join(workspace_root, "output_clips"),
        os.path.join(workspace_root, "temp"),
    ]
    target_allowed = allowed_dirs or default_allowed

    # Also allow system temp dir
    import tempfile
    target_allowed.append(os.path.realpath(tempfile.gettempdir()))
    # Also allow workspace directory for temp_* files
    target_allowed.append(workspace_root)

    is_allowed = False
    for d in target_allowed:
        try:
            d_canon = os.path.realpath(os.path.abspath(d))
            if canonical_path.startswith(d_canon):
                # If in root workspace, only allow files starting with temp_ or audio_ or ending with .srt/.mp3 chunk
                if d_canon == workspace_root:
                    base = os.path.basename(canonical_path)
                    if base.startswith("temp_") or base.startswith("audio_") or base.startswith("chunk_"):
                        is_allowed = True
                        break
                else:
                    is_allowed = True
                    break
        except Exception:
            continue

    if not is_allowed:
        return False

    if os.path.exists(canonical_path) and os.path.isfile(canonical_path):
        try:
            os.remove(canonical_path)
            return True
        except Exception:
            return False

    return False


class LocalSessionManager:
    """
    Manages a secure local session token for backend protection.
    Binds to 127.0.0.1 and checks origin / bearer / custom header token.
    """
    def __init__(self, token_file: str = ".session_token"):
        self.token_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), token_file)
        self.session_token = self._load_or_create_token()

    def _load_or_create_token(self) -> str:
        if os.path.exists(self.token_file):
            try:
                with open(self.token_file, "r", encoding="utf-8") as f:
                    token = f.read().strip()
                    if token and len(token) >= 32:
                        return token
            except Exception:
                pass

        # Generate a new 256-bit cryptographically secure token
        token = secrets.token_hex(32)
        try:
            with open(self.token_file, "w", encoding="utf-8") as f:
                f.write(token)
        except Exception:
            pass
        return token

    def verify_token(self, token: Optional[str]) -> bool:
        if not token:
            return False
        return hmac.compare_digest(self.session_token, token.strip())


# Allowed origins for CORS and CSRF protection
ALLOWED_ORIGIN_PATTERNS = [
    re.compile(r"^http://127\.0\.0\.1(:\d+)?$"),
    re.compile(r"^http://localhost(:\d+)?$"),
    re.compile(r"^http://\[::1\](:\d+)?$"),
    re.compile(r"^https://.*\.vercel\.app$"),
]


def is_allowed_origin(origin: Optional[str]) -> bool:
    """Validates if the HTTP Origin header is allowed."""
    if not origin or origin == "null":
        # Allow PyWebView, electron, or local file origin
        return True

    for pattern in ALLOWED_ORIGIN_PATTERNS:
        if pattern.match(origin):
            return True

    return False
