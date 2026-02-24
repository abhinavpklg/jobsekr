"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import {
  timeAgo,
  formatSalary,
  atsDisplayName,
  remoteTypeClasses,
  capitalize,
} from "@/lib/utils";
import { useJobActionsContext } from "@/components/JobActionsProvider";

interface JobCardProps {
  job: Job;
  showActions?: boolean;
  onUnhide?: () => void;
}

export default function JobCard({
  job,
  showActions = true,
  onUnhide,
}: JobCardProps) {
  const { user, getState, saveJob, applyJob, hideJob, unsaveJob, unhideJob } =
    useJobActionsContext();
  const [overlay, setOverlay] = useState<"none" | "applied-ask" | "applied-yes">(
    "none"
  );
  const [actionLoading, setActionLoading] = useState(false);

  const state = getState(job.id);
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const isSaved = state?.status === "saved";
  const isApplied = state?.status === "applied";
  const isHidden = state?.status === "hidden";

  const handleCardClick = () => {
    window.open(job.url, "_blank", "noopener,noreferrer");
    // Show "Applied?" overlay if user is logged in and hasn't already applied
    if (user && !isApplied) {
      setOverlay("applied-ask");
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setActionLoading(true);
    if (isSaved) {
      await unsaveJob(job.id);
    } else {
      await saveJob(job.id);
    }
    setActionLoading(false);
  };

  const handleHide = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setActionLoading(true);
    if (isHidden) {
      await unhideJob(job.id);
      onUnhide?.();
    } else {
      await hideJob(job.id);
    }
    setActionLoading(false);
  };

  const handleAppliedYes = async () => {
    setActionLoading(true);
    await applyJob(job.id);
    setOverlay("applied-yes");
    setTimeout(() => setOverlay("none"), 1500);
    setActionLoading(false);
  };

  const handleAppliedNo = () => {
    setOverlay("none");
  };

  return (
    <div
      className={`group relative cursor-pointer rounded-lg border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${
        isApplied
          ? "border-green-bright/30 bg-green-bright/5"
          : isHidden
          ? "border-gray-800 bg-surface/50 opacity-60"
          : "border-gray-800 bg-surface hover:border-gray-600 hover:bg-surface/80"
      }`}
    >
      {/* Applied overlay */}
      {overlay !== "none" && (
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center rounded-lg transition-colors ${
            overlay === "applied-yes"
              ? "bg-green-bright/20"
              : "bg-accent/10 backdrop-blur-sm"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {overlay === "applied-ask" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-white">Did you apply?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleAppliedYes}
                  disabled={actionLoading}
                  className="rounded-md bg-green-bright px-4 py-1.5 text-sm font-medium text-white hover:bg-green-bright/90 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={handleAppliedNo}
                  className="rounded-md border border-gray-600 px-4 py-1.5 text-sm text-gray-300 hover:border-gray-400 transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          )}
          {overlay === "applied-yes" && (
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-green-bright"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm font-medium text-green-bright">
                Marked as applied!
              </span>
            </div>
          )}
        </div>
      )}

      <div onClick={handleCardClick}>
        {/* Top row: title + time */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors line-clamp-2">
            {job.title}
          </h3>
          <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
            {timeAgo(job.first_seen)}
          </span>
        </div>

        {/* Company + location */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
          {job.company_name && (
            <span className="font-medium text-gray-300">
              {job.company_name}
            </span>
          )}
          {job.company_name && job.location && <span>·</span>}
          {job.location && <span className="truncate">{job.location}</span>}
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {job.remote_type !== "unknown" && (
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${remoteTypeClasses(job.remote_type)}`}
            >
              {capitalize(job.remote_type)}
            </span>
          )}

          <span className="inline-flex items-center rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
            {atsDisplayName(job.ats_source)}
          </span>

          {salary && (
            <span className="inline-flex items-center rounded bg-green-bright/10 px-1.5 py-0.5 text-xs font-medium text-green-bright">
              {salary}
            </span>
          )}

          {job.seniority && job.seniority !== "mid" && (
            <span className="inline-flex items-center rounded bg-purple-500/15 px-1.5 py-0.5 text-xs text-purple-400">
              {capitalize(job.seniority)}
            </span>
          )}

          {isApplied && (
            <span className="inline-flex items-center rounded bg-green-bright/15 px-1.5 py-0.5 text-xs font-medium text-green-bright">
              ✓ Applied
            </span>
          )}
        </div>

        {/* Description preview */}
        {job.description && (
          <p className="mt-2.5 text-xs text-gray-500 line-clamp-2">
            {job.description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {showActions && user && (
        <div className="mt-3 flex items-center gap-2 border-t border-gray-800 pt-3">
          <button
            onClick={handleSave}
            disabled={actionLoading || isApplied}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              isSaved
                ? "bg-accent/15 text-accent"
                : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            <svg
              className="h-3.5 w-3.5"
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isApplied) {
                setOverlay("applied-ask");
              }
            }}
            disabled={actionLoading || isApplied}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              isApplied
                ? "bg-green-bright/15 text-green-bright"
                : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {isApplied ? "Applied" : "Applied?"}
          </button>

          <button
            onClick={handleHide}
            disabled={actionLoading}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              isHidden
                ? "bg-gray-700 text-gray-300"
                : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
            {isHidden ? "Unhide" : "Hide"}
          </button>
        </div>
      )}
    </div>
  );
}