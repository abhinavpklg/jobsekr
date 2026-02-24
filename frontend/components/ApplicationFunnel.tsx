"use client";

import { PIPELINE_STATUSES } from "@/lib/types";

interface ApplicationFunnelProps {
  statusCounts: Record<string, number>;
  total: number;
}

export default function ApplicationFunnel({ statusCounts, total }: ApplicationFunnelProps) {
  if (total === 0) return null;

  // Funnel stages: applied → screening → interviewing → offered
  // Rejected and archived are shown separately as drop-offs
  const funnelStages = ["applied", "screening", "interviewing", "offered"];
  const dropOffStages = ["rejected", "archived"];

  // Calculate cumulative: each stage includes itself + all later stages
  const getCumulativeCount = (stageIndex: number): number => {
    let count = 0;
    for (let i = stageIndex; i < funnelStages.length; i++) {
      count += statusCounts[funnelStages[i]] || 0;
    }
    return count;
  };

  const maxCount = total;

  return (
    <div className="space-y-3">
      {/* Funnel bars */}
      <div className="space-y-2">
        {funnelStages.map((stage, i) => {
          const count = statusCounts[stage] || 0;
          const cumulative = getCumulativeCount(i);
          const pct = maxCount > 0 ? (cumulative / maxCount) * 100 : 0;
          const meta = PIPELINE_STATUSES.find((p) => p.value === stage);
          if (!meta) return null;

          return (
            <div key={stage} className="flex items-center gap-3">
              <div className="w-24 text-right">
                <span className="text-xs text-t-secondary">{meta.label}</span>
              </div>
              <div className="flex-1 h-8 bg-surface rounded overflow-hidden relative">
                <div
                  className="h-full rounded transition-all duration-500 ease-out flex items-center"
                  style={{
                    width: `${Math.max(pct, count > 0 ? 3 : 0)}%`,
                    backgroundColor: meta.color,
                    opacity: 0.8,
                  }}
                >
                  {count > 0 && (
                    <span className="px-2 text-xs font-medium text-t-inverse whitespace-nowrap">
                      {count}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 text-right">
                <span className="text-xs text-t-muted">
                  {pct > 0 ? `${Math.round(pct)}%` : "0%"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drop-off row */}
      {dropOffStages.some((s) => (statusCounts[s] || 0) > 0) && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-24" />
            <div className="flex-1 flex gap-4">
              {dropOffStages.map((stage) => {
                const count = statusCounts[stage] || 0;
                const meta = PIPELINE_STATUSES.find((p) => p.value === stage);
                if (!meta || count === 0) return null;

                return (
                  <div key={stage} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-xs text-t-muted">
                      {meta.label}: <span className="text-t-secondary font-medium">{count}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Conversion rate */}
      {total > 0 && (statusCounts["offered"] || 0) > 0 && (
        <div className="pt-2 border-t border-border text-center">
          <span className="text-xs text-t-muted">
            Offer rate:{" "}
            <span className="font-semibold text-green-bright">
              {Math.round(((statusCounts["offered"] || 0) / total) * 100)}%
            </span>{" "}
            ({statusCounts["offered"]} of {total} applications)
          </span>
        </div>
      )}
    </div>
  );
}