"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-t-primary hover:text-accent transition-colors">
              Jobsekr
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-xs text-t-muted hover:text-t-secondary transition-colors">
                Jobs
              </Link>
              <Link href="/about" className="text-xs text-t-muted hover:text-t-secondary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-xs text-t-muted hover:text-t-secondary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          <p className="text-xs text-t-muted">
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/abnav/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Abhinav
            </a>{" "}
            · © {new Date().getFullYear()} Jobsekr
          </p>
        </div>
      </div>
    </footer>
  );
}