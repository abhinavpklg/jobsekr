"""
Jobsekr — Data Cleanup

Runs daily to:
1. Mark jobs as inactive if not seen for 48+ hours
2. Delete jobs older than 90 days
3. Log cleanup stats to scrape_runs

Usage:
    python cleanup.py
    python cleanup.py --dry-run
"""

from __future__ import annotations

import argparse
import logging

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from config import JOB_TTL_DAYS, JOB_STALE_HOURS, LOG_FORMAT, LOG_LEVEL
import db

logging.basicConfig(format=LOG_FORMAT, level=LOG_LEVEL)
logger = logging.getLogger(__name__)


def run_cleanup(dry_run: bool = False) -> None:
    """Run the full cleanup pipeline."""
    run_id = None
    if not dry_run:
        run_id = db.start_scrape_run(source="cleanup", job_title="daily cleanup")

    # 1. Mark stale jobs inactive
    logger.info("Marking jobs inactive if last_seen > %dh ago...", JOB_STALE_HOURS)
    if dry_run:
        stale = db.get_client().table("jobs").select("id", count="exact").eq("is_active", True).lt(
            "last_seen",
            _cutoff_iso(hours=JOB_STALE_HOURS),
        ).execute()
        stale_count = stale.count or 0
        logger.info("[DRY RUN] Would mark %d jobs inactive", stale_count)
    else:
        stale_count = db.mark_inactive_jobs(hours=JOB_STALE_HOURS)

    # 2. Delete old jobs
    logger.info("Deleting jobs older than %d days...", JOB_TTL_DAYS)
    if dry_run:
        old = db.get_client().table("jobs").select("id", count="exact").lt(
            "first_seen",
            _cutoff_iso(days=JOB_TTL_DAYS),
        ).execute()
        old_count = old.count or 0
        logger.info("[DRY RUN] Would delete %d old jobs", old_count)
    else:
        old_count = db.delete_old_jobs(days=JOB_TTL_DAYS)

    # 3. Summary
    total_jobs = db.get_job_count(active_only=False)
    active_jobs = db.get_job_count(active_only=True)

    logger.info("=== CLEANUP COMPLETE ===")
    logger.info("Stale jobs marked inactive: %d", stale_count)
    logger.info("Old jobs deleted: %d", old_count)
    logger.info("Total jobs in DB: %d (active: %d)", total_jobs, active_jobs)

    if run_id and not dry_run:
        db.finish_scrape_run(
            run_id=run_id,
            total_found=stale_count + old_count,
            new_found=0,
            errors=0,
            status="completed",
        )


def _cutoff_iso(hours: int = 0, days: int = 0) -> str:
    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours, days=days)
    return cutoff.isoformat()


def main() -> None:
    parser = argparse.ArgumentParser(description="Jobsekr Data Cleanup")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be cleaned up")
    args = parser.parse_args()
    run_cleanup(dry_run=args.dry_run)


if __name__ == "__main__":
    main()