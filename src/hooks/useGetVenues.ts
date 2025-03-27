"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

type Venue = {
  id: string;
  name: string;
  address: string;
};

export function useGetVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function fetchVenues() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("venues")
          .select("id, name, address")
          .order("name");

        if (error) throw new Error(error.message);

        setVenues(data || []);
      } catch (err) {
        console.error("공연장 목록을 불러오는데 실패했습니다:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("공연장 목록을 불러오는데 실패했습니다"),
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchVenues();
  }, [supabase]);

  return { venues, isLoading, error };
}
