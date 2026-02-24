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
        <svg
          className="h-12 w-12 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-300">
          No jobs match your filters
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or removing some filters
        </p>
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

  // Build page numbers to show
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-1">
          {/* Previous */}
          {page > 1 ? (
            <Link
              href={buildPageUrl(page - 1)}
              className="rounded-md border border-gray-700 bg-surface px-3 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-md border border-gray-800 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
              ← Prev
            </span>
          )}

          {/* Page numbers */}
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-600">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildPageUrl(p as number)}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  p === page
                    ? "bg-accent text-white font-medium"
                    : "border border-gray-700 bg-surface text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                {p}
              </Link>
            )
          )}

          {/* Next */}
          {page < totalPages ? (
            <Link
              href={buildPageUrl(page + 1)}
              className="rounded-md border border-gray-700 bg-surface px-3 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-md border border-gray-800 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
              Next →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}

/**
 * Generate page numbers with ellipsis for large page counts.
 * Always shows first, last, current, and 1 neighbor on each side.
 * Example: [1, '...', 4, 5, 6, '...', 20]
 */
function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const neighbors = 1;

  // Always show page 1
  pages.push(1);

  const rangeStart = Math.max(2, current - neighbors);
  const rangeEnd = Math.min(total - 1, current + neighbors);

  if (rangeStart > 2) {
    pages.push("...");
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < total - 1) {
    pages.push("...");
  }

  // Always show last page
  pages.push(total);

  return pages;
}