"use client";

import { useState, useEffect } from "react";
import { Artist } from "@/types/artist";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export function useGetArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function fetchArtists() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("artists")
          .select("*")
          .order("name_official");

        if (error) throw new Error(error.message);

        setArtists(data || []);
      } catch (err) {
        console.error("아티스트 목록을 불러오는데 실패했습니다:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("아티스트 목록을 불러오는데 실패했습니다"),
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtists();
  }, [supabase]);

  return { artists, isLoading, error };
}
