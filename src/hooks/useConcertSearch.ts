"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";

type Concert = Tables<"concerts"> & {
  venue: Tables<"venues"> | null;
  artists: Tables<"artists">[];
};

type SearchType = "concert" | "artist";

export function useConcertSearch(
  initialTerm = "",
  initialType: SearchType = "concert",
) {
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const fetchConcerts = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setConcerts([]);
        return;
      }

      setIsLoading(true);
      try {
        let concertResults: Tables<"concerts">[] = [];

        if (searchType === "concert") {
          // 콘서트 제목으로 검색
          const { data, error } = await supabase
            .from("concerts")
            .select(`*`)
            .ilike("title", `%${debouncedSearchTerm}%`)
            .limit(10);

          if (error) throw error;
          concertResults = data || [];
        } else {
          // 아티스트 이름으로 검색 후 관련 콘서트 찾기
          const { data: artists, error: artistError } = await supabase
            .from("artists")
            .select("id")
            .or(
              `name_official.ilike.%${debouncedSearchTerm}%,` +
                `name_ko.ilike.%${debouncedSearchTerm}%,` +
                `name_en.ilike.%${debouncedSearchTerm}%`,
            );

          if (artistError) throw artistError;

          if (artists && artists.length > 0) {
            const { data: concerts, error: concertsError } = await supabase
              .from("concerts")
              .select("*")
              .in(
                "id",
                (
                  await supabase
                    .from("concerts_artists")
                    .select("concert_id")
                    .in(
                      "artist_id",
                      artists.map((a) => a.id),
                    )
                ).data?.map((ca) => ca.concert_id) || [],
              );

            if (concertsError) throw concertsError;
            concertResults = concerts || [];
          }
        }

        // 추가 정보 가져오기
        const enhancedResults = await Promise.all(
          concertResults.map(async (concert) => {
            const { data: venueData } = await supabase
              .from("venues")
              .select("*")
              .eq("id", concert.venue_id)
              .single();

            const { data: artistsData } = await supabase
              .from("artists")
              .select("*")
              .in(
                "id",
                (
                  await supabase
                    .from("concerts_artists")
                    .select("artist_id")
                    .eq("concert_id", concert.id)
                ).data?.map((ca) => ca.artist_id) || [],
              );

            return {
              ...concert,
              venue: venueData || null,
              artists: artistsData || [],
            };
          }),
        );

        setConcerts(enhancedResults as Concert[]);
      } catch (error) {
        console.error("검색 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcerts();
  }, [debouncedSearchTerm, searchType, supabase]);

  return {
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    concerts,
    isLoading,
    debouncedSearchTerm,
  };
}
