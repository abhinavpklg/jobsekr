import { createSupabaseServer } from "@/lib/supabase-server";
import type { Job } from "@/lib/types";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import JobList from "@/components/JobList";

const PAGE_SIZE = 30;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    remote?: string;
    ats?: string;
    location?: string;
    sort?: string;
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

  // Sort
  const ascending = params.sort === "oldest";
  query = query.order("first_seen", { ascending });

  // Offset-based pagination
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

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { jobs, count, page, totalPages } = await fetchJobs(params);

  return (
    <div className="min-h-screen">
      <Header />
      <FilterBar totalJobs={count} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <JobList
          jobs={jobs}
          page={page}
          totalPages={totalPages}
        />
      </main>
    </div>
  );
}