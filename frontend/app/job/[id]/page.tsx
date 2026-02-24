import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Job } from "@/lib/types";
import Header from "@/components/Header";
import JobDetailClient from "@/components/JobDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("jobs")
    .select("title, company_name, location")
    .eq("id", id)
    .single();

  if (!data) return { title: "Job not found — Jobsekr" };

  const title = `${data.title}${data.company_name ? ` at ${data.company_name}` : ""} — Jobsekr`;
  const description = `${data.title}${data.company_name ? ` at ${data.company_name}` : ""}${data.location ? ` · ${data.location}` : ""}`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const job = data as Job;

  return (
    <div className="min-h-screen">
      <Header />
      <JobDetailClient job={job} />
    </div>
  );
}