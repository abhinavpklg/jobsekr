import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold text-t-primary">About Jobsekr</h1>

        <div className="mt-6 space-y-6 text-sm text-t-secondary leading-relaxed">
          <p>
            Jobsekr is a job aggregation platform built for tech professionals who are tired
            of checking multiple job boards every day. We scrape jobs directly from ATS APIs —
            not Google, not scraped HTML — so you see postings within hours of them going live.
          </p>

          <h2 className="text-lg font-semibold text-t-primary pt-4">How it works</h2>
          <p>
            Our scrapers run three times a day, hitting the public APIs of 14+ Applicant Tracking
            Systems including Greenhouse, Lever, Ashby, Workable, SmartRecruiters, and more.
            We track 500+ companies and deduplicate everything so you get one clean feed.
          </p>

          <h2 className="text-lg font-semibold text-t-primary pt-4">What makes us different</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">Freshness:</strong> Jobs appear within hours of posting, not days. We scrape ATS APIs directly, 3× daily.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">One place:</strong> Stop switching between Greenhouse boards, Lever pages, and LinkedIn. Everything is here.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">Application tracking:</strong> Save jobs, mark as applied, track your pipeline from applied → screening → interview → offer.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">Free:</strong> No premium tiers, no paywalls. Just jobs.</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-t-primary pt-4">ATS sources</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Greenhouse", "Lever", "Ashby", "Workable", "SmartRecruiters",
              "Recruitee", "BambooHR", "Breezy", "Teamtailor", "Pinpoint",
              "Rippling", "Personio", "Freshteam", "Dover",
            ].map((ats) => (
              <span
                key={ats}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-t-secondary"
              >
                {ats}
              </span>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-t-primary pt-4">FAQ</h2>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-t-primary">How fresh is the data?</p>
              <p>Jobs are scraped 3× daily (morning, afternoon, evening). Most postings appear within 4-8 hours of being published on the ATS.</p>
            </div>
            <div>
              <p className="font-medium text-t-primary">Is it really free?</p>
              <p>Yes. Jobsekr is a passion project built to solve a real problem. No ads, no premium plans.</p>
            </div>
            <div>
              <p className="font-medium text-t-primary">How do I track my applications?</p>
              <p>Sign up for a free account. Then save jobs, mark them as applied, and update the status as you progress through interviews.</p>
            </div>
            <div>
              <p className="font-medium text-t-primary">Can I filter by remote?</p>
              <p>Yes — filter by Remote, Hybrid, or On-site. You can also filter by location, ATS source, and keyword search.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-t-muted">
              Built by{" "}
              <a
                href="https://www.linkedin.com/in/abnav/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Abhinav
              </a>
              . Open source on{" "}
              <a
                href="https://github.com/abhinavpklg/jobsekr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}