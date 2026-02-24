"""
Jobsekr — Main ATS Job Scraper

Reads verified companies from Supabase, hits their ATS APIs concurrently,
parses responses, and batch-inserts jobs with deduplication.

Usage:
    python ats_scraper.py
    python ats_scraper.py --ats greenhouse
    python ats_scraper.py --company stripe --ats greenhouse
    python ats_scraper.py --dry-run
    python ats_scraper.py --limit 10
    python ats_scraper.py --fresh
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Any

import aiohttp

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from config import (
    LOG_FORMAT,
    LOG_LEVEL,
    SCRAPE_CONCURRENCY,
    SCRAPE_TIMEOUT,
)
import db
from parsers import ParsedJob
from parsers import greenhouse as greenhouse_parser
from parsers import lever as lever_parser
from parsers import ashby as ashby_parser
from parsers import workable as workable_parser
from parsers import smartrecruiters as smartrecruiters_parser
from parsers import recruitee as recruitee_parser
from parsers import dover as dover_parser
from parsers import breezy as breezy_parser
from parsers import bamboohr as bamboohr_parser
from parsers import teamtailor as teamtailor_parser
from parsers import pinpoint as pinpoint_parser
from parsers import rippling as rippling_parser
from parsers import personio as personio_parser
from parsers import freshteam as freshteam_parser

logging.basicConfig(format=LOG_FORMAT, level=LOG_LEVEL)
logger = logging.getLogger(__name__)

PARSERS: dict[str, Any] = {
    "greenhouse": greenhouse_parser,
    "lever": lever_parser,
    "ashby": ashby_parser,
    "workable": workable_parser,
    "smartrecruiters": smartrecruiters_parser,
    "recruitee": recruitee_parser,
    "dover": dover_parser,
    "breezy": breezy_parser,
    "bamboohr": bamboohr_parser,
    "teamtailor": teamtailor_parser,
    "pinpoint": pinpoint_parser,
    "rippling": rippling_parser,
    "personio": personio_parser,
    "freshteam": freshteam_parser,
}


async def scrape_company(
    session: aiohttp.ClientSession,
    company: dict[str, Any],
    semaphore: asyncio.Semaphore,
) -> tuple[str, str, list[ParsedJob], str | None]:
    company_id: str = company["id"]
    slug: str = company["slug"]
    ats: str = company["ats"]
    api_url: str = company.get("api_url", "")

    if not api_url:
        return company_id, slug, [], "no api_url"

    parser = PARSERS.get(ats)
    if not parser:
        return company_id, slug, [], f"no parser for {ats}"

    async with semaphore:
        try:
            async with session.get(
                api_url,
                timeout=aiohttp.ClientTimeout(total=SCRAPE_TIMEOUT),
                headers={"Accept": "application/json"},
            ) as resp:
                if resp.status == 200:
                    try:
                        data = await resp.json(content_type=None)
                    except Exception as e:
                        return company_id, slug, [], f"json decode error: {e}"
                    jobs = parser.parse_jobs(data, slug)
                    return company_id, slug, jobs, None
                elif resp.status == 404:
                    return company_id, slug, [], None
                elif resp.status == 429:
                    return company_id, slug, [], "rate limited (429)"
                else:
                    return company_id, slug, [], f"HTTP {resp.status}"
        except asyncio.TimeoutError:
            return company_id, slug, [], "timeout"
        except aiohttp.ClientError as e:
            return company_id, slug, [], f"connection error: {e}"
        except Exception as e:
            return company_id, slug, [], f"unexpected error: {e}"


async def run_scraper(
    ats_filter: str | None = None,
    company_filter: str | None = None,
    limit: int | None = None,
    dry_run: bool = False,
    fresh: bool = True,
) -> None:
    companies = db.get_verified_companies(ats=ats_filter)

    if company_filter:
        companies = [c for c in companies if c["slug"] == company_filter.lower()]
    if limit:
        companies = companies[:limit]
    if not companies:
        logger.warning("No companies to scrape")
        return

    ats_counts: dict[str, int] = {}
    for c in companies:
        ats_counts[c["ats"]] = ats_counts.get(c["ats"], 0) + 1

    logger.info("Scraping %d companies across %d ATS platforms", len(companies), len(ats_counts))
    for ats, count in sorted(ats_counts.items(), key=lambda x: -x[1]):
        logger.info("  %s: %d companies", ats, count)

    run_id: str | None = None
    if not dry_run:
        run_id = db.start_scrape_run(
            source="ats_scraper",
            config={"ats_filter": ats_filter, "company_count": len(companies)},
        )

    # Fetch all jobs concurrently
    start_time = time.monotonic()
    semaphore = asyncio.Semaphore(SCRAPE_CONCURRENCY)
    connector = aiohttp.TCPConnector(limit=SCRAPE_CONCURRENCY, limit_per_host=3)

    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [scrape_company(session, c, semaphore) for c in companies]
        results = await asyncio.gather(*tasks)

    fetch_time = time.monotonic() - start_time
    logger.info("API fetching done in %.1fs", fetch_time)

    # Collect all jobs into a flat list for batch insert
    all_jobs: list[dict[str, Any]] = []
    error_count = 0
    companies_with_jobs = 0
    company_map = {c["id"]: c for c in companies}

    for company_id, slug, parsed_jobs, error in results:
        if error:
            error_count += 1
            if error not in ("no api_url",) and "404" not in str(error):
                logger.warning("Error scraping %s: %s", slug, error)
            continue

        if not parsed_jobs:
            continue

        companies_with_jobs += 1
        company_info = company_map.get(company_id, {})
        company_name = company_info.get("name")
        ats_source = company_info.get("ats", "unknown")

        for job in parsed_jobs:
            all_jobs.append({
                "url": job.url,
                "title": job.title,
                "ats_source": ats_source,
                "company_name": company_name,
                "company_id": company_id,
                "location": job.location,
                "description": job.description,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "remote_type": job.remote_type,
                "seniority": job.seniority,
                "category": job.category,
                "tags": job.tags,
                "posted_at": job.posted_at,
                "raw_data": job.raw_data,
            })

    logger.info("Total jobs parsed: %d from %d companies", len(all_jobs), companies_with_jobs)

    if dry_run:
        logger.info("[DRY RUN] Would insert/update %d jobs", len(all_jobs))
        return

    # Batch insert
    insert_start = time.monotonic()
    new_count, existing_count = db.batch_insert_jobs(all_jobs)
    insert_time = time.monotonic() - insert_start

    # Update company metadata in batch
    now = datetime.now(timezone.utc).isoformat()
    for company_id, slug, parsed_jobs, error in results:
        if parsed_jobs:
            db.update_company(company_id, {
                "last_scraped_at": now,
                "job_count": len(parsed_jobs),
                "verified": True,
            })

    elapsed = time.monotonic() - start_time

    logger.info("=== SCRAPE COMPLETE ===")
    logger.info("Total time: %.1fs (fetch: %.1fs, insert: %.1fs)", elapsed, fetch_time, insert_time)
    logger.info("Companies: %d scraped / %d total", companies_with_jobs, len(companies))
    logger.info("Jobs: %d new, %d existing, %d errors", new_count, existing_count, error_count)
    logger.info("Total jobs in DB: %d", db.get_job_count(active_only=False))

    if run_id:
        db.finish_scrape_run(
            run_id=run_id,
            total_found=len(all_jobs),
            new_found=new_count,
            errors=error_count,
            status="completed",
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Jobsekr ATS Job Scraper")
    parser.add_argument("--ats", type=str, default=None)
    parser.add_argument("--company", type=str, default=None)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--fresh", action="store_true")

    args = parser.parse_args()

    asyncio.run(run_scraper(
        ats_filter=args.ats,
        company_filter=args.company,
        limit=args.limit,
        dry_run=args.dry_run,
        fresh=args.fresh,
    ))


if __name__ == "__main__":
    main()