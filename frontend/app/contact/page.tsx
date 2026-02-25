"use client";

import { useState } from "react";
import Header from "@/components/Header";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("feedback");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // For MVP, we'll store feedback in a simple way
    // Option 1: mailto link
    // Option 2: Store in Supabase (if you create a feedback table)
    // For now, open mailto
    const subject = encodeURIComponent(`[Jobsekr ${type}] from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nType: ${type}\n\n${message}`
    );
    window.open(`mailto:contact@jobsekr.app?subject=${subject}&body=${body}`);

    setSubmitted(true);
    setLoading(false);
  };

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-t-primary placeholder-t-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-t-primary">Contact Us</h1>
        <p className="mt-2 text-sm text-t-secondary">
          Got feedback, found a bug, or want to request a feature? We&apos;d love to hear from you.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-lg border border-green-bright/30 bg-green-muted p-6 text-center">
            <svg
              className="mx-auto h-10 w-10 text-green-bright"
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
            <h3 className="mt-3 text-lg font-medium text-t-primary">Thanks!</h3>
            <p className="mt-1 text-sm text-t-secondary">
              Your message has been prepared. If the email client didn&apos;t open,
              reach out directly at{" "}
              <a href="mailto:contact@jobsekr.app" className="text-accent hover:underline">
                contact@jobsekr.app
              </a>
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setMessage("");
              }}
              className="mt-4 text-sm text-accent hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm text-t-secondary mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm text-t-secondary mb-1">
                Email
              </label>
              <input
                id="contactEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm text-t-secondary mb-1">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputClass}
              >
                <option value="feedback">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-t-secondary mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className={inputClass}
                placeholder="Tell us what is on your mind..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !name || !email || !message}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-t-inverse hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send message"}
            </button>
          </div>
        )}

        {/* Direct links */}
        <div className="mt-10 pt-8 border-t border-border">
          <h3 className="text-sm font-semibold text-t-primary mb-3">Other ways to reach us</h3>
          <div className="space-y-2">
            <a
              href="mailto:contact@jobsekr.app"
              className="flex items-center gap-2 text-sm text-t-secondary hover:text-accent transition-colors"
            >
              <span>✉️</span> contact@jobsekr.app
            </a>
            <a
              href="https://github.com/abhinavpklg/jobsekr/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-t-secondary hover:text-accent transition-colors"
            >
              <span>🐛</span> Report a bug on GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}