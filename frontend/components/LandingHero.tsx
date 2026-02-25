"use client";

import Link from "next/link";

interface LandingHeroProps {
  stats: {
    jobCount: number;
    companyCount: number;
    atsCount: number;
  };
}

export default function LandingHero({ stats }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 mb-6">
          <span className="h-2 w-2 rounded-full bg-green-bright animate-pulse" />
          <span className="text-xs text-t-secondary">
            Updated 3× daily · {stats.jobCount.toLocaleString()} jobs live
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-t-primary">
          Every new tech job,{" "}
          <span className="text-accent">within hours</span>
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-lg text-t-secondary max-w-2xl mx-auto">
          Stop checking 10 job sites. Jobsekr aggregates fresh postings from{" "}
          {stats.atsCount}+ ATS platforms and {stats.companyCount.toLocaleString()}+ companies
          — all in one fast, searchable dashboard.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-t-inverse hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
          >
            Start tracking for free →
          </Link>
          <a
            href="#jobs"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-t-secondary hover:text-t-primary hover:border-border-hover transition-colors"
          >
            Browse jobs
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div>
            <p className="text-2xl font-bold text-t-primary">{stats.jobCount.toLocaleString()}</p>
            <p className="text-xs text-t-muted mt-1">Active jobs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-t-primary">{stats.companyCount.toLocaleString()}</p>
            <p className="text-xs text-t-muted mt-1">Companies</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-t-primary">{stats.atsCount}+</p>
            <p className="text-xs text-t-muted mt-1">ATS sources</p>
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          <FeatureCard
            icon="⚡"
            title="Hours, not days"
            description="Jobs scraped directly from ATS APIs 3× daily. See postings within hours of going live."
          />
          <FeatureCard
            icon="🔍"
            title="One search, all sources"
            description="Greenhouse, Lever, Ashby, Workable, and more — all in one searchable, filterable feed."
          />
          <FeatureCard
            icon="📊"
            title="Track & analyze"
            description="Save jobs, track applications, update statuses, and visualize your job search progress."
          />
        </div>

        {/* ATS logos strip */}
        <div className="mt-12">
          <p className="text-xs text-t-muted mb-3">Aggregating from</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "Greenhouse", "Lever", "Ashby", "Workable", "SmartRecruiters",
              "Recruitee", "BambooHR", "Breezy", "Teamtailor", "Pinpoint",
              "Rippling", "Personio", "Freshteam", "Dover",
            ].map((ats) => (
              <span
                key={ats}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-t-muted"
              >
                {ats}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Anchor for "Browse jobs" scroll */}
      <div id="jobs" />
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-3 text-sm font-semibold text-t-primary">{title}</h3>
      <p className="mt-1.5 text-xs text-t-secondary leading-relaxed">{description}</p>
    </div>
  );
}