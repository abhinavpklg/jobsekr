import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { JobActionsProvider } from "@/components/JobActionsProvider";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jobsekr - Every new job posting, in one place",
  description:
    "Job aggregation platform that brings fresh postings from hundreds of companies into one searchable dashboard with application tracking.",
  openGraph: {
    title: "Jobsekr - Every new job posting, in one place",
    description:
      "Fresh job postings from hundreds of companies, updated multiple times daily.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen antialiased flex flex-col`}>
        <ThemeProvider>
          <JobActionsProvider>
            <div className="flex-1">{children}</div>
            <Footer />
          </JobActionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}