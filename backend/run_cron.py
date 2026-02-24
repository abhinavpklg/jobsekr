"""
Jobsekr — Cron Runner

Single entry point for Railway cron jobs.
The CRON_JOB env var determines which job to run.

Railway setup: create 3 services, each with a different CRON_JOB value:
  - CRON_JOB=scrape    → runs ats_scraper.py    (3x/day)
  - CRON_JOB=discover  → runs discover + probe  (1x/day)
  - CRON_JOB=cleanup   → runs cleanup.py        (1x/day)
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from config import LOG_FORMAT, LOG_LEVEL

logging.basicConfig(format=LOG_FORMAT, level=LOG_LEVEL)
logger = logging.getLogger(__name__)


def main() -> None:
    job = os.environ.get("CRON_JOB", "").lower().strip()

    if not job:
        logger.error("CRON_JOB env var not set. Use: scrape, discover, or cleanup")
        sys.exit(1)

    logger.info("=== Starting cron job: %s ===", job)

    if job == "scrape":
        from ats_scraper import run_scraper
        asyncio.run(run_scraper(fresh=True))

    elif job == "discover":
        from discover_companies import run_discovery
        asyncio.run(run_discovery())

    elif job == "cleanup":
        from cleanup import run_cleanup
        run_cleanup()

    else:
        logger.error("Unknown CRON_JOB: %s. Use: scrape, discover, or cleanup", job)
        sys.exit(1)

    logger.info("=== Cron job %s finished ===", job)


if __name__ == "__main__":
    main()