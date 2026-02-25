"use client";

export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="14" stroke="var(--accent)" strokeWidth="3" fill="none" opacity="0.3" />
        <path
          d="M34 20a14 14 0 0 0-14-14"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line x1="30" y1="30" x2="42" y2="42" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      </svg>
    </div>
  );
}