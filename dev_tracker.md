# Jobsekr — Development Tracker

**Started:** Feb 24, 2026
**Target MVP:** Mar 2, 2026
**Status:** 🟢 In Progress
**Live URL:** https://jobsekr.app

---

## Day 1 — Foundation ✅

- [x] Supabase project + schema migration
- [x] Next.js 14 app scaffolded + deployed to Vercel
- [x] Auth: email + Google OAuth, callback, session middleware
- [x] Protected routes, domain configured (jobsekr.app)

---

## Day 2 — Data Pipeline ✅

- [x] 14 ATS parsers built
- [x] Company discovery (seed, GitHub, cross-probe)
- [x] Async scraper with batch inserts, checkpoint resume, connection retry
- [x] 517 companies, 261 verified, 20,437 jobs scraped
- [ ] GitHub Actions crons (deployed, pending verification)

---

## Day 3 — Job Listing Page ✅

- [x] Job listing with filters (search, remote, ATS, location, sort)
- [x] Offset pagination with page numbers
- [x] URL-based shareable filter state

---

## Day 4 — Application Tracking + Profile ✅

- [x] Save/Apply/Hide actions on job cards
- [x] "Did you apply?" overlay flow
- [x] Dashboard with tabs (Saved/Applied/Hidden/All)
- [x] Light/dark theme system
- [x] Profile page with default filter preferences
- [x] Job detail modal with full description + copy button

---

## Day 5 — Analytics + Polish (In Progress)

- [ ] **Analytics page** (`/analytics`):
  - [ ] Stats cards: today's applications, past month, total all-time
  - [ ] Search bar for historical job applications
  - [ ] Status pipeline: applied → screening → interviewing → offer / rejected / archived
  - [ ] User can update job status from the analytics page
  - [ ] Visual application funnel chart
- [ ] Build `backend/cleanup.py` ✅
- [ ] GitHub Actions crons verified
- [ ] Frontend polish:
  - [ ] Toast notifications for actions
  - [ ] Mobile responsive fixes
  - [ ] Favicon and branding
- [ ] SEO: page titles, meta descriptions

---

## Day 6 — Testing & Hardening

- [ ] End-to-end testing all flows
- [ ] Performance checks (<2s load, <500ms search)
- [ ] Error monitoring

---

## Day 7 — Launch

- [ ] Landing hero section
- [ ] README.md
- [ ] Launch posts (Twitter, Reddit, HN, LinkedIn)
- [ ] Monitoring setup

---

## Metrics After Launch

| Metric | Day 1 | Day 3 | Day 7 |
|---|---|---|---|
| Jobs in DB | 20,437 | | |
| Companies tracked | 517 | | |
| ATS sources live | 7 | | |
| Registered users | 0 | | |
| Page views | 0 | | |
| Jobs applied/saved | 0 | | |

---

## Bugs / Issues Log

| # | Description | Status | Fixed In |
|---|---|---|---|
| 1 | Supabase HTTP/2 connection drop after ~10k requests | Fixed | Day 2 |
| 2 | Parser __pycache__ stale module cache | Fixed | Day 2 |
| 3 | YC Work at a Startup returns 0 (JS-rendered) | Known | Deferred |
| 4 | ESLint unused vars in dashboard/profile | Fixed | Day 4 |
| 5 | useSearchParams needs Suspense boundary | Fixed | Day 4 |
| 6 | Scraper timeout on GitHub Actions (15min) | Fixed | Day 5 — batch inserts |

---

## Decisions Made

| Date | Decision | Rationale |
|---|---|---|
| Feb 24 | Built 14 ATS parsers instead of 5 | More job coverage, marginal effort per parser |
| Feb 24 | Skip YC scraping for MVP | JS-rendered, no public API |
| Feb 24 | Checkpoint resume + connection retry | Supabase HTTP/2 drops |
| Feb 24 | Offset pagination with page numbers | User preference over cursor-based |
| Feb 24 | Rebranded SYKR → Jobsekr | Domain jobsekr.app |
| Feb 24 | CSS variables for theming | Runtime theme switching |
| Feb 24 | GitHub Actions over Railway | Free for public repos |
| Feb 24 | Job detail modal instead of page | Better browse UX, kept /job/[id] for SEO |
| Feb 24 | Batch job inserts | 10x faster scraper for GitHub Actions budget |