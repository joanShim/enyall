"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Concert } from "@/types/concert";

export function useGetConcert(concertId: string | null) {
  const [concert, setConcert] = useState<Concert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (!concertId) {
      setIsLoading(false);
      return;
    }

    const fetchConcertData = async () => {
      try {
        const { data: concertData, error: concertError } = await supabase
          .from("concerts")
          .select(
            `
            *,
            venue:venues(*),
            artists:concerts_artists(
              artist:artists(*)
            )
          `,
          )
          .eq("id", concertId)
          .single();

        if (concertError) throw concertError;
        setConcert(concertData);
        setIsLoading(false);
      } catch (error) {
        console.error("콘서트 정보 로딩 실패:", error);
        setError(
          error instanceof Error ? error : new Error("콘서트 정보 로딩 실패"),
        );
        setIsLoading(false);
      }
    };

    fetchConcertData();
  }, [concertId, supabase]);

  return { concert, isLoading, error };
}
