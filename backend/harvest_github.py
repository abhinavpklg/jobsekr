"""
Jobsekr - Harvest Companies from GitHub Hiring Repos

Specifically targets hiring-without-whiteboards and similar repos.
For each company link found, tries to:
1. Extract ATS slug directly from URL if it matches known ATS patterns
2. For unknown URLs, probe the company name against all supported ATS APIs
   to find their career board

Usage:
    python harvest_github.py
    python harvest_github.py --dry-run
    python harvest_github.py --probe   # also probe unmatched companies
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import re
from typing import Any
from urllib.parse import urlparse

import aiohttp

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from config import (
    ATS_API_TEMPLATES,
    ATS_DOMAIN_MAP,
    LOG_FORMAT,
    LOG_LEVEL,
    SCRAPE_CONCURRENCY,
    SCRAPE_TIMEOUT,
)
import db
from seed_from_results import extract_slug_from_url

logging.basicConfig(format=LOG_FORMAT, level=LOG_LEVEL)
logger = logging.getLogger(__name__)

# Repos to harvest (can add more)
REPOS = [
    "poteto/hiring-without-whiteboards",
    "pittcsc/Summer2025-Internships",
    "SimplifyJobs/New-Grad-Positions",
    "remoteintech/remote-jobs",
    "tramcar/awesome-job-boards",
    "Effective-Immediately/Effective-Immediately",
    "ReaVNaiL/New-Grad-2024",
    "coderQuad/New-Grad-Positions-2023",
]


async def fetch_readme(session: aiohttp.ClientSession, repo: str) -> str | None:
    """Fetch README content from a GitHub repo."""
    for branch in ["main", "master"]:
        url = f"https://raw.githubusercontent.com/{repo}/{branch}/README.md"
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status == 200:
                    return await resp.text()
        except Exception as e:
            logger.debug("Failed to fetch %s (%s): %s", repo, branch, e)
    return None


def extract_companies_from_readme(text: str, repo: str) -> list[dict[str, Any]]:
    """
    Extract all company career links from a README.
    Returns list of {name, url, ats, slug} dicts.
    """
    companies: list[dict[str, Any]] = []

    # Match markdown links: [Company Name](url)
    link_pattern = re.compile(r'\[([^\]]+)\]\((https?://[^\s\)]+)\)')

    for match in link_pattern.finditer(text):
        name = match.group(1).strip()
        url = match.group(2).strip()

        # Skip non-career links
        if _is_skip_url(url):
            continue

        # Clean name (remove markdown formatting)
        name = re.sub(r'[*_`~]', '', name).strip()
        if not name or len(name) < 2 or len(name) > 100:
            continue

        # Try to extract ATS info from URL
        extracted = extract_slug_from_url(url)
        if extracted:
            companies.append({
                "name": name,
                "url": url,
                "ats": extracted.ats,
                "slug": extracted.slug,
                "source": f"github:{repo}",
            })
        else:
            # Unknown URL - save company name for cross-probing
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            if slug and len(slug) >= 2:
                companies.append({
                    "name": name,
                    "url": url,
                    "ats": "unknown",
                    "slug": slug,
                    "source": f"github:{repo}",
                })

    return companies


def _is_skip_url(url: str) -> bool:
    """Skip non-career URLs."""
    skip_domains = {
        "github.com", "en.wikipedia.org", "twitter.com", "x.com",
        "linkedin.com/company", "crunchbase.com", "techcrunch.com",
        "youtube.com", "medium.com", "blog.", "docs.", "arxiv.org",
    }
    hostname = urlparse(url).hostname or ""
    path = urlparse(url).path.lower()

    for skip in skip_domains:
        if skip in hostname or skip in url:
            return True

    # Skip anchor links and images
    if path.endswith(('.png', '.jpg', '.gif', '.svg', '.pdf')):
        return True

    return False


def deduplicate(companies: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deduplicate by (ats, slug)."""
    seen: dict[str, dict[str, Any]] = {}
    for c in companies:
        key = f"{c['ats']}:{c['slug']}"
        if key not in seen:
            seen[key] = c
        elif c.get("name") and not seen[key].get("name"):
            seen[key] = c  # Prefer entries with names
    return list(seen.values())


async def probe_company_against_all_ats(
    session: aiohttp.ClientSession,
    slug: str,
    name: str | None,
    semaphore: asyncio.Semaphore,
) -> list[dict[str, Any]]:
    """Try a company slug against all ATS APIs."""
    found: list[dict[str, Any]] = []
    probe_ats = ["greenhouse", "lever", "ashby", "workable", "smartrecruiters",
                 "recruitee", "breezy", "bamboohr"]

    for ats in probe_ats:
        template = ATS_API_TEMPLATES.get(ats, "")
        if not template:
            continue

        api_url = template.format(slug=slug)

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
                            job_count = _count_jobs(data)
                            if job_count > 0:
                                found.append({
                                    "ats": ats,
                                    "slug": slug,
                                    "name": name,
                                    "api_url": api_url,
                                    "job_count": job_count,
                                })
                        except Exception:
                            pass
            except Exception:
                pass

    return found


def _count_jobs(data: Any) -> int:
    """Count jobs in an ATS response."""
    if isinstance(data, list):
        return len(data)
    if isinstance(data, dict):
        for key in ("jobs", "results", "content", "offers", "postings"):
            if key in data and isinstance(data[key], list):
                return len(data[key])
    return 0


async def run_harvest(dry_run: bool = False, probe: bool = False) -> None:
    """Main harvest pipeline."""
    connector = aiohttp.TCPConnector(limit=SCRAPE_CONCURRENCY)

    all_companies: list[dict[str, Any]] = []

    async with aiohttp.ClientSession(connector=connector) as session:
        # Fetch all READMEs
        for repo in REPOS:
            logger.info("Fetching %s...", repo)
            text = await fetch_readme(session, repo)
            if not text:
                logger.warning("  Could not fetch README for %s", repo)
                continue

            companies = extract_companies_from_readme(text, repo)
            logger.info("  Found %d company links", len(companies))
            all_companies.extend(companies)

    # Deduplicate
    unique = deduplicate(all_companies)
    ats_companies = [c for c in unique if c["ats"] != "unknown"]
    unknown_companies = [c for c in unique if c["ats"] == "unknown"]

    logger.info("\nTotal unique companies: %d", len(unique))
    logger.info("  With known ATS: %d", len(ats_companies))
    logger.info("  Unknown (need probing): %d", len(unknown_companies))

    # ATS breakdown
    ats_counts: dict[str, int] = {}
    for c in ats_companies:
        ats_counts[c["ats"]] = ats_counts.get(c["ats"], 0) + 1
    for ats, count in sorted(ats_counts.items(), key=lambda x: -x[1]):
        logger.info("    %s: %d", ats, count)

    if dry_run:
        logger.info("\n[DRY RUN] Would add %d companies", len(ats_companies))
        logger.info("Sample ATS companies:")
        for c in ats_companies[:20]:
            logger.info("  %s/%s (%s)", c["ats"], c["slug"], c.get("name", ""))
        logger.info("\nSample unknown companies (would probe):")
        for c in unknown_companies[:20]:
            logger.info("  %s (%s)", c["slug"], c.get("name", ""))
        return

    # Insert known ATS companies
    run_id = db.start_scrape_run(source="harvest_github", config={"repos": REPOS})
    added = 0

    for c in ats_companies:
        api_url = ATS_API_TEMPLATES.get(c["ats"], "").format(slug=c["slug"])
        result = db.upsert_company(
            slug=c["slug"],
            ats=c["ats"],
            name=c.get("name"),
            api_url=api_url,
            careers_url=c.get("url"),
            source=c["source"],
        )
        if result:
            added += 1

    logger.info("Added %d known ATS companies", added)

    # Probe unknown companies
    probed_found = 0
    if probe and unknown_companies:
        logger.info("\nProbing %d unknown companies against all ATS...", len(unknown_companies))
        semaphore = asyncio.Semaphore(SCRAPE_CONCURRENCY)
        connector = aiohttp.TCPConnector(limit=SCRAPE_CONCURRENCY)

        async with aiohttp.ClientSession(connector=connector) as session:
            for i, c in enumerate(unknown_companies):
                if i % 50 == 0 and i > 0:
                    logger.info("  Probed %d / %d...", i, len(unknown_companies))

                results = await probe_company_against_all_ats(
                    session, c["slug"], c.get("name"), semaphore
                )

                for r in results:
                    db_result = db.upsert_company(
                        slug=r["slug"],
                        ats=r["ats"],
                        name=r.get("name"),
                        api_url=r["api_url"],
                        source=c["source"],
                    )
                    if db_result:
                        db.update_company(db_result["id"], {
                            "verified": True,
                            "job_count": r["job_count"],
                        })
                        probed_found += 1

        logger.info("Cross-probe found %d new ATS companies", probed_found)

    # Probe all unverified
    logger.info("\nVerifying all unverified companies...")
    from discover_companies import probe_unverified_companies
    verified, total_probed = await probe_unverified_companies()

    db.finish_scrape_run(
        run_id=run_id,
        total_found=added + probed_found,
        new_found=added + probed_found,
        errors=0,
        status="completed",
    )

    logger.info("\n=== HARVEST COMPLETE ===")
    logger.info("Companies from READMEs: %d", added)
    logger.info("Found via cross-probe: %d", probed_found)
    logger.info("Newly verified: %d", verified)
    logger.info("Total companies: %d", db.get_company_count())
    logger.info("Total verified: %d", len(db.get_verified_companies()))


def main() -> None:
    parser = argparse.ArgumentParser(description="Harvest companies from GitHub repos")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be added")
    parser.add_argument("--probe", action="store_true", help="Cross-probe unknown companies")
    args = parser.parse_args()

    asyncio.run(run_harvest(dry_run=args.dry_run, probe=args.probe))


if __name__ == "__main__":
    main()