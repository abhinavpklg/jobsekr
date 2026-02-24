/**
 * Format a relative time string like "2h ago", "3d ago"
 */
export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Format salary range like "$120K – $180K"
 */
export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string = "USD"
): string | null {
  if (!min && !max) return null;

  const fmt = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toString();
  };

  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  if (min && max) return `${symbol}${fmt(min)} – ${symbol}${fmt(max)}`;
  if (min) return `${symbol}${fmt(min)}+`;
  if (max) return `Up to ${symbol}${fmt(max)}`;
  return null;
}

/**
 * Capitalize first letter
 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * ATS source display name
 */
const ATS_NAMES: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  workable: "Workable",
  smartrecruiters: "SmartRecruiters",
  recruitee: "Recruitee",
  dover: "Dover",
  breezy: "Breezy",
  bamboohr: "BambooHR",
  teamtailor: "Teamtailor",
  pinpoint: "Pinpoint",
  rippling: "Rippling",
  personio: "Personio",
  freshteam: "Freshteam",
  linkedin: "LinkedIn",
};

export function atsDisplayName(ats: string): string {
  return ATS_NAMES[ats.toLowerCase()] || capitalize(ats);
}

/**
 * Remote type badge color classes
 */
export function remoteTypeClasses(type: string): string {
  switch (type) {
    case "remote":
      return "bg-red-500/20 text-red-400";
    case "hybrid":
      return "bg-yellow-500/20 text-yellow-400";
    case "onsite":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}