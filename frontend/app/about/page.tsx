import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold text-t-primary">About Jobsekr</h1>

        <div className="mt-6 space-y-6 text-sm text-t-secondary leading-relaxed">
          <p>
            Jobsekr is a job aggregation platform built for people who are tired
            of checking multiple job boards every day. We pull jobs directly from
            company career pages so you see postings within hours of them going live.
          </p>

          <h2 className="text-lg font-semibold text-t-primary pt-4">How it works</h2>
          <p>
            We pull data from the web multiple times a day, collecting job postings from hundreds of
            companies across various career platforms. Everything is deduplicated and
            presented in one clean, searchable feed.
          </p>

          <h2 className="text-lg font-semibold text-t-primary pt-4">What makes us different</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">Freshness:</strong> Jobs appear within hours of posting, not days. We pull data from career pages directly.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">One place:</strong> Stop switching between different career pages and job boards. Everything is here.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">Application tracking:</strong> Save jobs, mark as applied, track your pipeline from applied to screening to interview to offer.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <p><strong className="text-t-primary">Free:</strong> No premium tiers, no paywalls. Just jobs.</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-t-primary pt-4">FAQ</h2>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-t-primary">How fresh is the data?</p>
              <p>Jobs are pulled from the web multiple times daily. Most postings appear within a few hours of being published.</p>
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
              <p>Yes. Filter by Remote, Hybrid, or On-site. You can also filter by location, source, and keyword search.</p>
            </div>
            <div>
              <p className="font-medium text-t-primary">What types of jobs are listed?</p>
              <p>We aggregate jobs across all roles and industries. Use the search and filters to find what you are looking for.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-t-muted">
              Open source on{" "}
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