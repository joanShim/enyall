"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Concert } from "@/types/concert";

export function useGetConcerts(artistId: string | null) {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchConcerts() {
      if (!artistId) {
        setConcerts([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 아티스트와 연결된 콘서트 가져오기
        const { data: concertsData, error: concertsError } = await supabase
          .from("concerts")
          .select(
            `
            *,
            venue:venues(*),
            artists:concerts_artists(
              artist:artists(*)
            ),
            concert_schedules(*)
          `,
          )
          .in(
            "id",
            (
              await supabase
                .from("concerts_artists")
                .select("concert_id")
                .eq("artist_id", artistId)
            ).data?.map((ca) => ca.concert_id) || [],
          )
          .order("title");

        if (concertsError) throw new Error(concertsError.message);

        setConcerts(concertsData || []);
      } catch (err) {
        console.error("콘서트 목록을 불러오는데 실패했습니다:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("콘서트 목록을 불러오는데 실패했습니다"),
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchConcerts();
  }, [supabase, artistId]);

  return { concerts, isLoading, error };
}
