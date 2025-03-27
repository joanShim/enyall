"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Concert } from "@/types/concert";
import { useReviewFormStore } from "@/store/reviewFormStore";

export function useGetConcert(concertId: string | null) {
  const [concert, setConcert] = useState<Concert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createBrowserSupabaseClient();
  const { isPendingConcert } = useReviewFormStore();

  useEffect(() => {
    if (!concertId) {
      setIsLoading(false);
      return;
    }

    const fetchConcertData = async () => {
      try {
        // isPendingConcert 플래그에 따라 다른 테이블에서 조회
        if (isPendingConcert) {
          const { data: concertData, error: concertError } = await supabase
            .from("concerts_pending")
            .select(
              `
              *,
              venue:venues(*),
              artists:concerts_artists_pending(
                artist:artists(*)
              )
            `,
            )
            .eq("id", concertId)
            .single();

          if (concertError) throw concertError;
          setConcert(concertData);
        } else {
          const { data: concertData, error: concertError } = await supabase
            .from("concerts")
            .select("*")
            .eq("id", concertId)
            .single();

          if (concertError) throw concertError;

          if (concertData && concertData.venue_id) {
            const { data: venueData, error: venueError } = await supabase
              .from("venues")
              .select("*")
              .eq("id", concertData.venue_id)
              .single();

            if (!venueError && venueData) {
              setConcert({
                ...concertData,
                venue: venueData,
              });
            } else {
              setConcert(concertData);
            }
          } else {
            setConcert(concertData);
          }
        }

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
  }, [concertId, supabase, isPendingConcert]);

  return { concert, isLoading, error };
}
