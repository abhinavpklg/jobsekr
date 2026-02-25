import { createSupabaseServer } from "@/lib/supabase-server";
import type { Job } from "@/lib/types";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import JobList from "@/components/JobList";
import DefaultFiltersLoader from "@/components/DefaultFiltersLoader";
import LandingHero from "@/components/LandingHero";

const PAGE_SIZE = 30;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    remote?: string;
    ats?: string;
    location?: string;
    days?: string;
    page?: string;
  }>;
}

async function fetchJobs(
  params: Awaited<PageProps["searchParams"]>
): Promise<{ jobs: Job[]; count: number; page: number; totalPages: number }> {
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  // Text search
  if (params.q) {
    query = query.textSearch("title", params.q, {
      type: "websearch",
      config: "english",
    });
  }

  // Remote filter
  if (params.remote) {
    query = query.eq("remote_type", params.remote);
  }

  // ATS filter
  if (params.ats) {
    query = query.eq("ats_source", params.ats);
  }

  // Location filter
  if (params.location) {
    query = query.ilike("location", `%${params.location}%`);
  }

  // Time range filter
  if (params.days) {
    const days = parseInt(params.days, 10);
    if (days > 0) {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.or(`posted_at.gte.${cutoff},and(posted_at.is.null,first_seen.gte.${cutoff})`);
    }
  }

  // Sort newest first
  query = query
    .order("posted_at", { ascending: false, nullsFirst: false })
    .order("first_seen", { ascending: false });

  // Pagination
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to fetch jobs:", error);
    return { jobs: [], count: 0, page: 1, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    jobs: (data as Job[]) || [],
    count: total,
    page,
    totalPages,
  };
}

async function fetchStats(): Promise<{ jobCount: number; companyCount: number; atsCount: number }> {
  const supabase = await createSupabaseServer();

  const [jobRes, companyRes] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("verified", true),
  ]);

  return {
    jobCount: jobRes.count || 0,
    companyCount: companyRes.count || 0,
    atsCount: 14,
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const hasFilters = params.q || params.remote || params.ats || params.location || params.days || params.page;

  const [{ jobs, count, page, totalPages }, stats] = await Promise.all([
    fetchJobs(params),
    fetchStats(),
  ]);

  return (
    <div className="min-h-screen">
      <Header />
      {!hasFilters && <LandingHero stats={stats} />}
      <FilterBar totalJobs={count} />
      <DefaultFiltersLoader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <JobList jobs={jobs} page={page} totalPages={totalPages} />
      </main>
    </div>
  );
}