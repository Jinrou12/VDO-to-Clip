import sqlite3
import json
import threading
import time
import traceback
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import uuid
import os

from security import mask_secret

def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# Define Job States according to architecture specification
class JobState:
    QUEUED = "QUEUED"
    PREPARING = "PREPARING"
    PREFLIGHT = "PREFLIGHT" # Alias for backward compatibility
    EXTRACTING_AUDIO = "EXTRACTING_AUDIO"
    FILTERING = "FILTERING"
    TRANSCRIBING = "TRANSCRIBING"
    NORMALIZING_TRANSCRIPT = "NORMALIZING_TRANSCRIPT"
    SCOUTING = "SCOUTING"
    CLUSTERING = "CLUSTERING"
    SPECIALIST_ANALYSIS = "SPECIALIST_ANALYSIS"
    ANALYZING = "ANALYZING" # Alias for backward compatibility
    QUALITY_REVIEW = "QUALITY_REVIEW"
    RENDERING = "RENDERING"
    COMPLETED = "COMPLETED"
    CANCEL_REQUESTED = "CANCEL_REQUESTED"
    CANCELLED = "CANCELLED"
    FAILED_RETRYABLE = "FAILED_RETRYABLE"
    FAILED_PERMANENT = "FAILED_PERMANENT"
    FAILED = "FAILED" # Generic alias


class JobModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_path: str
    status: str = JobState.QUEUED
    progress: int = 0
    message: str = ""
    result_data: str = "{}"
    created_at: str = Field(default_factory=_utc_now_iso)
    updated_at: str = Field(default_factory=_utc_now_iso)
    error_log: str = ""
    is_cancelled: bool = False
    retry_count: int = 0


class JobManager:
    def __init__(self, db_path="jobs.db"):
        self.db_path = db_path
        self._init_db()
        self._worker_thread = None
        self._stop_event = threading.Event()
        self._process_func = None
        self._lock = threading.RLock()

    def _get_connection(self):
        return sqlite3.connect(self.db_path, timeout=30.0)

    def _init_db(self):
        conn = self._get_connection()
        try:
            with conn:
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS jobs (
                        id TEXT PRIMARY KEY,
                        video_path TEXT,
                        status TEXT,
                        progress INTEGER,
                        message TEXT,
                        result_data TEXT,
                        created_at TEXT,
                        updated_at TEXT,
                        error_log TEXT,
                        is_cancelled INTEGER DEFAULT 0,
                        retry_count INTEGER DEFAULT 0
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS clip_feedback (
                        id TEXT PRIMARY KEY,
                        job_id TEXT,
                        video_path TEXT,
                        start_sec REAL,
                        end_sec REAL,
                        duration REAL,
                        title TEXT,
                        hook_text TEXT,
                        score REAL,
                        action TEXT,
                        reason TEXT,
                        adjusted_start REAL,
                        adjusted_end REAL,
                        created_at TEXT
                    )
                ''')
                # Check and perform non-destructive schema migrations
                cursor.execute("PRAGMA table_info(jobs)")
                cols = [row[1] for row in cursor.fetchall()]
                if "is_cancelled" not in cols:
                    cursor.execute("ALTER TABLE jobs ADD COLUMN is_cancelled INTEGER DEFAULT 0")
                if "retry_count" not in cols:
                    cursor.execute("ALTER TABLE jobs ADD COLUMN retry_count INTEGER DEFAULT 0")
        finally:
            conn.close()

    def set_processor(self, process_func):
        """Sets the function to call to process a job."""
        self._process_func = process_func

    def create_job(self, video_path: str) -> JobModel:
        job = JobModel(video_path=video_path)
        self._save_job(job)
        return job

    def get_job(self, job_id: str) -> Optional[JobModel]:
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM jobs WHERE id = ?', (job_id,))
            row = cursor.fetchone()
            if row:
                return self._row_to_job(row)
        finally:
            conn.close()
        return None

    def _row_to_job(self, row) -> JobModel:
        return JobModel(
            id=row[0],
            video_path=row[1],
            status=row[2],
            progress=row[3],
            message=row[4],
            result_data=row[5],
            created_at=row[6],
            updated_at=row[7],
            error_log=row[8] if row[8] else "",
            is_cancelled=bool(row[9]) if len(row) > 9 and row[9] is not None else False,
            retry_count=int(row[10]) if len(row) > 10 and row[10] is not None else 0
        )

    def get_all_jobs(self) -> List[JobModel]:
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM jobs ORDER BY created_at DESC')
            rows = cursor.fetchall()
            return [self._row_to_job(r) for r in rows]
        finally:
            conn.close()

    def update_job(
        self,
        job_id: str,
        status: str = None,
        progress: int = None,
        message: str = None,
        result_data: dict = None,
        error_log: str = None,
        is_cancelled: bool = None,
        retry_count: int = None
    ):
        with self._lock:
            job = self.get_job(job_id)
            if not job:
                return

            if status is not None:
                job.status = status
            if progress is not None:
                job.progress = max(0, min(100, progress))
            if message is not None:
                job.message = mask_secret(message)
            if result_data is not None:
                job.result_data = json.dumps(result_data, ensure_ascii=False)
            if error_log is not None:
                job.error_log = mask_secret(error_log)
            if is_cancelled is not None:
                job.is_cancelled = is_cancelled
            if retry_count is not None:
                job.retry_count = retry_count

            job.updated_at = _utc_now_iso()
            self._save_job(job)

    def _save_job(self, job: JobModel):
        conn = self._get_connection()
        try:
            with conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO jobs 
                    (id, video_path, status, progress, message, result_data, created_at, updated_at, error_log, is_cancelled, retry_count) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    job.id,
                    job.video_path,
                    job.status,
                    job.progress,
                    job.message,
                    job.result_data,
                    job.created_at,
                    job.updated_at,
                    job.error_log,
                    1 if job.is_cancelled else 0,
                    job.retry_count
                ))
        finally:
            conn.close()

    def cancel_job(self, job_id: str) -> bool:
        """Flags a job as cancelled. Running tasks should check is_cancelled."""
        with self._lock:
            job = self.get_job(job_id)
            if not job:
                return False
            if job.status in (JobState.COMPLETED, JobState.CANCELLED):
                return False
            self.update_job(
                job_id,
                status=JobState.CANCELLED,
                message="Processing cancelled by user",
                is_cancelled=True
            )
            return True

    def is_cancelled(self, job_id: str) -> bool:
        """Returns True if the job has been flagged for cancellation."""
        job = self.get_job(job_id)
        if not job:
            return True
        return job.is_cancelled or job.status in (JobState.CANCEL_REQUESTED, JobState.CANCELLED)

    def retry_job(self, job_id: str) -> bool:
        """Resets a failed or cancelled job back to QUEUED for retry."""
        with self._lock:
            job = self.get_job(job_id)
            if not job:
                return False
            if job.status not in (JobState.FAILED, JobState.FAILED_RETRYABLE, JobState.CANCELLED):
                return False
            self.update_job(
                job_id,
                status=JobState.QUEUED,
                progress=0,
                message="Requeued for processing",
                is_cancelled=False,
                retry_count=job.retry_count + 1
            )
            return True

    def clear_finished_jobs(self) -> int:
        """Deletes completed, cancelled, or failed jobs from the database."""
        conn = self._get_connection()
        try:
            with conn:
                cursor = conn.cursor()
                cursor.execute(
                    "DELETE FROM jobs WHERE status IN (?, ?, ?, ?, ?)",
                    (JobState.COMPLETED, JobState.CANCELLED, JobState.FAILED, JobState.FAILED_RETRYABLE, JobState.FAILED_PERMANENT)
                )
                return cursor.rowcount
        finally:
            conn.close()

    def recover_interrupted_jobs(self) -> int:
        """
        Marks active jobs that were interrupted by a server restart or crash
        as FAILED_RETRYABLE so they can be resumed or retried safely.
        """
        active_states = (
            JobState.PREPARING, JobState.PREFLIGHT, JobState.EXTRACTING_AUDIO,
            JobState.FILTERING, JobState.TRANSCRIBING, JobState.NORMALIZING_TRANSCRIPT,
            JobState.SCOUTING, JobState.CLUSTERING, JobState.SPECIALIST_ANALYSIS,
            JobState.ANALYZING, JobState.QUALITY_REVIEW, JobState.RENDERING
        )
        recovered = 0
        with self._lock:
            jobs = self.get_all_jobs()
            for job in jobs:
                if job.status in active_states:
                    self.update_job(
                        job.id,
                        status=JobState.FAILED_RETRYABLE,
                        message="Server restart detected during processing. Ready to retry."
                    )
                    recovered += 1
        return recovered

    def start_worker(self):
        with self._lock:
            if self._worker_thread is None or not self._worker_thread.is_alive():
                self._stop_event.clear()
                self._worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
                self._worker_thread.start()
                print("[JobManager] Worker thread started.", flush=True)

    def stop_worker(self):
        self._stop_event.set()
        if self._worker_thread:
            self._worker_thread.join(timeout=2.0)
            self._worker_thread = None
            print("[JobManager] Worker thread stopped.", flush=True)

    def _worker_loop(self):
        while not self._stop_event.is_set():
            job = self._get_next_queued_job()
            if job and self._process_func:
                if self.is_cancelled(job.id):
                    self.update_job(job.id, status=JobState.CANCELLED, message="Cancelled before start")
                    continue

                try:
                    self.update_job(job.id, status=JobState.PREPARING, message="Starting processing")
                    self._process_func(job.id, self)
                except Exception as e:
                    err_trace = mask_secret(traceback.format_exc())
                    err_msg = mask_secret(str(e))
                    self.update_job(
                        job.id,
                        status=JobState.FAILED_RETRYABLE,
                        message=f"Error: {err_msg}",
                        error_log=err_trace
                    )
                    print(f"[JobManager] Job {job.id} failed safely: {err_msg}", flush=True)

            time.sleep(1)

    def _get_next_queued_job(self) -> Optional[JobModel]:
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM jobs WHERE status = 'QUEUED' AND is_cancelled = 0 ORDER BY created_at ASC LIMIT 1")
            row = cursor.fetchone()
            if row:
                return self.get_job(row[0])
        finally:
            conn.close()
        return None

    def record_clip_feedback(
        self,
        clip_id: str,
        job_id: str = "",
        video_path: str = "",
        start_sec: float = 0.0,
        end_sec: float = 0.0,
        duration: float = 0.0,
        title: str = "",
        hook_text: str = "",
        score: float = 0.0,
        action: str = "ACCEPTED",
        reason: str = "",
        adjusted_start: Optional[float] = None,
        adjusted_end: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Saves user feedback (ACCEPTED, REJECTED, EDITED) into SQLite
        to train few-shot memory and refine scoring preferences.
        """
        conn = self._get_connection()
        try:
            with conn:
                cursor = conn.cursor()
                now_iso = _utc_now_iso()
                cursor.execute('''
                    INSERT OR REPLACE INTO clip_feedback (
                        id, job_id, video_path, start_sec, end_sec, duration,
                        title, hook_text, score, action, reason,
                        adjusted_start, adjusted_end, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    clip_id, job_id, video_path, start_sec, end_sec, duration,
                    title, hook_text, score, action.upper(), reason,
                    adjusted_start, adjusted_end, now_iso
                ))
        finally:
            conn.close()
        return {"success": True, "id": clip_id, "action": action.upper()}

    def get_feedback_summary(self) -> Dict[str, Any]:
        """Returns statistics of accepted, rejected, and edited clips."""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT action, COUNT(*) FROM clip_feedback GROUP BY action')
            counts = dict(cursor.fetchall())
            cursor.execute('SELECT COUNT(*) FROM clip_feedback')
            total = cursor.fetchone()[0]
            return {"total": total, "counts": counts}
        finally:
            conn.close()

    def get_feedback_few_shots(self, limit: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """
        Retrieves recent accepted and rejected clips to inject into
        LLM prompts for few-shot dynamic personalization.
        """
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT title, hook_text, duration, score FROM clip_feedback
                WHERE action = 'ACCEPTED' ORDER BY created_at DESC LIMIT ?
            ''', (limit,))
            accepted = [
                {"title": r[0], "hook_text": r[1], "duration": r[2], "score": r[3]}
                for r in cursor.fetchall()
            ]

            cursor.execute('''
                SELECT title, hook_text, reason, score FROM clip_feedback
                WHERE action = 'REJECTED' ORDER BY created_at DESC LIMIT ?
            ''', (limit,))
            rejected = [
                {"title": r[0], "hook_text": r[1], "reason": r[2], "score": r[3]}
                for r in cursor.fetchall()
            ]

            return {"accepted": accepted, "rejected": rejected}
        finally:
            conn.close()

    def export_feedback_data(self) -> Dict[str, Any]:
        """Exports all accepted and rejected clips as a portable AI Knowledge Pack."""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM clip_feedback ORDER BY created_at DESC')
            rows = cursor.fetchall()
            cols = [col[0] for col in cursor.description]
            items = [dict(zip(cols, row)) for row in rows]
            return {
                "version": "1.0",
                "exported_at": _utc_now_iso(),
                "total_records": len(items),
                "knowledge_pack": items
            }
        finally:
            conn.close()

    def import_feedback_data(self, data: Dict[str, Any]) -> int:
        """Imports an AI Knowledge Pack into the local SQLite database."""
        items = data.get("knowledge_pack", [])
        if not items and isinstance(data, list):
            items = data
        conn = self._get_connection()
        count = 0
        try:
            with conn:
                cursor = conn.cursor()
                for it in items:
                    cid = it.get("id") or str(uuid.uuid4())
                    cursor.execute('''
                        INSERT OR REPLACE INTO clip_feedback (
                            id, job_id, video_path, start_sec, end_sec, duration,
                            title, hook_text, score, action, reason,
                            adjusted_start, adjusted_end, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        cid,
                        it.get("job_id", ""),
                        it.get("video_path", ""),
                        float(it.get("start_sec", 0.0)),
                        float(it.get("end_sec", 0.0)),
                        float(it.get("duration", 0.0)),
                        it.get("title", ""),
                        it.get("hook_text", ""),
                        float(it.get("score", 0.0)),
                        str(it.get("action", "ACCEPTED")).upper(),
                        it.get("reason", ""),
                        it.get("adjusted_start"),
                        it.get("adjusted_end"),
                        it.get("created_at") or _utc_now_iso()
                    ))
                    count += 1
        finally:
            conn.close()
        return count


# Global instance
job_manager = JobManager()
