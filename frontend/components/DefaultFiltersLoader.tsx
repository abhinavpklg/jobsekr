"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * On first visit to "/" with no filters set, load user's default filters
 * from their profile preferences and apply them to the URL.
 * Only runs once per session.
 */
export default function DefaultFiltersLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;

    // Only apply if no filters are currently set
    const hasFilters =
      searchParams.has("q") ||
      searchParams.has("remote") ||
      searchParams.has("ats") ||
      searchParams.has("location") ||
      searchParams.has("sort") ||
      searchParams.has("page");

    if (hasFilters) {
      applied.current = true;
      return;
    }

    const loadDefaults = async () => {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        applied.current = true;
        return;
      }

      const { data } = await supabase
        .from("user_profiles")
        .select("preferences")
        .eq("user_id", user.id)
        .single();

      if (!data?.preferences) {
        applied.current = true;
        return;
      }

      const prefs = data.preferences as Record<string, string>;
      const params = new URLSearchParams();

      if (prefs.default_query) params.set("q", prefs.default_query);
      if (prefs.default_remote) params.set("remote", prefs.default_remote);
      if (prefs.default_ats) params.set("ats", prefs.default_ats);
      if (prefs.default_location) params.set("location", prefs.default_location);
      if (prefs.default_sort) params.set("sort", prefs.default_sort);

      applied.current = true;

      const paramStr = params.toString();
      if (paramStr) {
        router.replace(`/?${paramStr}`);
      }
    };

    loadDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}