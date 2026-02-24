"use client";

import Link from "next/link";
import { useState } from "react";
import type { Job } from "@/lib/types";
import {
  timeAgo,
  formatSalary,
  atsDisplayName,
  capitalize,
} from "@/lib/utils";
import { useJobActionsContext } from "@/components/JobActionsProvider";

interface JobDetailClientProps {
  job: Job;
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const { user, getState, saveJob, applyJob, hideJob, unsaveJob, unhideJob } =
    useJobActionsContext();
  const [actionLoading, setActionLoading] = useState(false);

  const state = getState(job.id);
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const isSaved = state?.status === "saved";
  const isApplied = state?.status === "applied";
  const isHidden = state?.status === "hidden";

  // Extract full description from raw_data
  const fullDescription = extractDescription(job);

  const handleSave = async () => {
    if (!user) return;
    setActionLoading(true);
    if (isSaved) await unsaveJob(job.id);
    else await saveJob(job.id);
    setActionLoading(false);
  };

  const handleApply = async () => {
    if (!user) return;
    setActionLoading(true);
    await applyJob(job.id);
    setActionLoading(false);
  };

  const handleHide = async () => {
    if (!user) return;
    setActionLoading(true);
    if (isHidden) await unhideJob(job.id);
    else await hideJob(job.id);
    setActionLoading(false);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to jobs
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-t-primary">{job.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-t-secondary">
          {job.company_name && (
            <span className="font-medium text-t-primary">{job.company_name}</span>
          )}
          {job.location && <span>📍 {job.location}</span>}
          <span>🕐 {timeAgo(job.first_seen)}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {job.remote_type !== "unknown" && (
          <Badge
            className={
              job.remote_type === "remote"
                ? "bg-red-muted text-red-bright"
                : job.remote_type === "hybrid"
                ? "bg-yellow-muted text-yellow-bright"
                : "bg-accent-muted text-accent"
            }
          >
            {capitalize(job.remote_type)}
          </Badge>
        )}

        <Badge className="bg-surface text-t-muted">
          {atsDisplayName(job.ats_source)}
        </Badge>

        {salary && (
          <Badge className="bg-green-muted text-green-bright">{salary}</Badge>
        )}

        {job.seniority && (
          <Badge className="bg-purple-muted text-purple-bright">
            {capitalize(job.seniority)}
          </Badge>
        )}

        {job.category && (
          <Badge className="bg-surface text-t-secondary">{job.category}</Badge>
        )}

        {job.tags?.map((tag) => (
          <Badge key={tag} className="bg-surface text-t-muted">
            {tag}
          </Badge>
        ))}

        {isApplied && (
          <Badge className="bg-green-muted text-green-bright">✓ Applied</Badge>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-border">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-t-inverse hover:bg-accent-hover transition-colors"
        >
          Apply on {atsDisplayName(job.ats_source)} →
        </a>

        {user && (
          <>
            <button
              onClick={handleSave}
              disabled={actionLoading || isApplied}
              className={`flex items-center gap-1.5 rounded-md border px-4 py-2.5 text-sm transition-colors ${
                isSaved
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-t-secondary hover:border-border-hover hover:text-t-primary"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {isSaved ? "Saved" : "Save"}
            </button>

            {!isApplied && (
              <button
                onClick={handleApply}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-sm text-t-secondary hover:border-green-bright hover:text-green-bright transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Applied
              </button>
            )}

            <button
              onClick={handleHide}
              disabled={actionLoading}
              className={`flex items-center gap-1.5 rounded-md border px-4 py-2.5 text-sm transition-colors ${
                isHidden
                  ? "border-border bg-surface text-t-secondary"
                  : "border-border text-t-muted hover:border-border-hover hover:text-t-secondary"
              }`}
            >
              {isHidden ? "Unhide" : "Hide"}
            </button>
          </>
        )}
      </div>

      {/* Description */}
      {fullDescription ? (
        <div className="prose-custom">
          <h2 className="text-lg font-semibold text-t-primary mb-4">About this role</h2>
          <div
            className="text-sm text-t-secondary leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(fullDescription) }}
          />
        </div>
      ) : job.description ? (
        <div>
          <h2 className="text-lg font-semibold text-t-primary mb-4">About this role</h2>
          <p className="text-sm text-t-secondary leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-t-muted">
            Full description available on the original posting.
          </p>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            View on {atsDisplayName(job.ats_source)} →
          </a>
        </div>
      )}

      {/* Job metadata */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="text-sm font-semibold text-t-primary mb-3">Details</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {job.company_name && <DetailRow label="Company" value={job.company_name} />}
          {job.location && <DetailRow label="Location" value={job.location} />}
          {job.remote_type !== "unknown" && <DetailRow label="Work type" value={capitalize(job.remote_type)} />}
          {salary && <DetailRow label="Salary" value={salary} />}
          {job.seniority && <DetailRow label="Level" value={capitalize(job.seniority)} />}
          {job.category && <DetailRow label="Department" value={job.category} />}
          <DetailRow label="Source" value={atsDisplayName(job.ats_source)} />
          <DetailRow label="First seen" value={new Date(job.first_seen).toLocaleDateString()} />
          {job.posted_at && <DetailRow label="Posted" value={new Date(job.posted_at).toLocaleDateString()} />}
        </dl>
      </div>
    </main>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-t-muted">{label}</dt>
      <dd className="text-t-primary">{value}</dd>
    </>
  );
}

/**
 * Extract the full HTML description from raw_data based on ATS source.
 */
function extractDescription(job: Job): string | null {
  const raw = job.raw_data;
  if (!raw || typeof raw !== "object") return null;

  // Greenhouse: content field
  if (raw.content && typeof raw.content === "string") return raw.content;

  // Lever: description or descriptionPlain
  if (raw.description && typeof raw.description === "string") return raw.description;
  if (raw.descriptionPlain && typeof raw.descriptionPlain === "string") return raw.descriptionPlain;

  // Ashby: descriptionHtml or descriptionPlain
  if (raw.descriptionHtml && typeof raw.descriptionHtml === "string") return raw.descriptionHtml;

  // Workable, Dover, Breezy, etc.: description
  // Already checked above

  // Nested in attributes (Teamtailor, Pinpoint)
  const attrs = raw.attributes;
  if (attrs && typeof attrs === "object") {
    const a = attrs as Record<string, unknown>;
    if (a.body && typeof a.body === "string") return a.body;
    if (a.description && typeof a.description === "string") return a.description;
  }

  // Recruitee: description + requirements
  if (raw.requirements && typeof raw.requirements === "string") {
    const desc = (raw.description || "") as string;
    return `${desc}\n\n<h3>Requirements</h3>\n${raw.requirements}`;
  }

  return null;
}

/**
 * Basic HTML sanitization — allow safe tags only.
 */
function sanitizeHtml(html: string): string {
  // Remove script, style, iframe tags and their content
  let clean = html.replace(/<(script|style|iframe)[^>]*>[\s\S]*?<\/\1>/gi, "");

  // Remove event handlers
  clean = clean.replace(/\s+on\w+="[^"]*"/gi, "");
  clean = clean.replace(/\s+on\w+='[^']*'/gi, "");

  // Add target="_blank" to links
  clean = clean.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');

  return clean;
}