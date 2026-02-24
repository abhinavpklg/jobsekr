"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Job } from "@/lib/types";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: Job[];
  page: number;
  totalPages: number;
}

export default function JobList({ jobs, page, totalPages }: JobListProps) {
  const searchParams = useSearchParams();

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="h-12 w-12 text-t-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-t-primary">No jobs match your filters</h3>
        <p className="mt-1 text-sm text-t-muted">Try adjusting your search or removing some filters</p>
      </div>
    );
  }

  const buildPageUrl = (targetPage: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", targetPage.toString());
    }
    return `/?${params.toString()}`;
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-1">
          {page > 1 ? (
            <Link
              href={buildPageUrl(page - 1)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-t-secondary hover:border-border-hover hover:text-t-primary transition-colors"
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-md border border-border px-3 py-2 text-sm text-t-muted cursor-not-allowed">
              ← Prev
            </span>
          )}

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-sm text-t-muted">…</span>
            ) : (
              <Link
                key={p}
                href={buildPageUrl(p as number)}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  p === page
                    ? "bg-accent text-t-inverse font-medium"
                    : "border border-border bg-surface text-t-secondary hover:border-border-hover hover:text-t-primary"
                }`}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages ? (
            <Link
              href={buildPageUrl(page + 1)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-t-secondary hover:border-border-hover hover:text-t-primary transition-colors"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-md border border-border px-3 py-2 text-sm text-t-muted cursor-not-allowed">
              Next →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);

  if (rangeStart > 2) pages.push("...");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}