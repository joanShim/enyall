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
        // 먼저 콘서트 정보 가져오기
        const { data: concertData, error: concertError } = await supabase
          .from("concerts")
          .select("*")
          .eq("id", concertId)
          .single();

        if (concertError) throw concertError;

        // 콘서트 데이터가 있고 venue_id가 있으면 venue 정보 가져오기
        if (concertData && concertData.venue_id) {
          const { data: venueData, error: venueError } = await supabase
            .from("venues")
            .select("*")
            .eq("id", concertData.venue_id)
            .single();

          if (!venueError && venueData) {
            // venue 정보를 concert 객체에 추가
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
