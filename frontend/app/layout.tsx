import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { JobActionsProvider } from "@/components/JobActionsProvider";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jobsekr — Every new tech job, within hours",
  description:
    "Job aggregation platform for US-based tech professionals. Fresh jobs from 14+ ATS platforms, updated multiple times daily.",
  openGraph: {
    title: "Jobsekr — Every new tech job, within hours",
    description:
      "Fresh jobs from Greenhouse, Lever, Ashby, and 11 more ATS platforms.",
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