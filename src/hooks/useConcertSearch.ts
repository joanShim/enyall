"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";

type Concert = Tables<"concerts"> & {
  venue: Tables<"venues"> | null;
  artists: Tables<"artists">[];
};

export function useConcertSearch(initialTerm = "") {
  const [searchTerm, setSearchTerm] = useState(initialTerm);
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
        // 콘서트 제목으로 검색
        const { data: titleResults, error: titleError } = await supabase
          .from("concerts")
          .select(`*`)
          .ilike("title", `%${debouncedSearchTerm}%`)
          .limit(10);

        if (titleError) {
          console.error("제목 검색 오류:", titleError);
          return;
        }

        // artists_json 필드 내 name_official, name_ko, name_en으로 검색
        const { data: artistJsonResults, error: artistJsonError } =
          await supabase
            .from("concerts")
            .select(`*`)
            .or(
              `artists_json->>name_official.ilike.%${debouncedSearchTerm}%,` +
                `artists_json->>name_ko.ilike.%${debouncedSearchTerm}%,` +
                `artists_json->>name_en.ilike.%${debouncedSearchTerm}%`,
            )
            .limit(10);

        if (artistJsonError) {
          console.error("아티스트 JSON 검색 오류:", artistJsonError);
        }

        // 결과 합치기 및 중복 제거
        const allResults = [
          ...(titleResults || []),
          ...(artistJsonResults || []),
        ];

        // ID 기준으로 중복 제거
        const uniqueResults = Array.from(
          new Map(allResults.map((item) => [item.id, item])).values(),
        );

        // 각 콘서트에 대한 추가 정보 가져오기
        const enhancedResults = await Promise.all(
          uniqueResults.map(async (concert) => {
            // 공연장 정보 가져오기
            const { data: venueData } = await supabase
              .from("venues")
              .select("*")
              .eq("id", concert.venue_id)
              .single();

            // 아티스트 정보 가져오기
            const { data: artistsData } = await supabase
              .from("concerts_artists")
              .select(
                `
                artist:artists (*)
              `,
              )
              .eq("concert_id", concert.id);

            return {
              ...concert,
              venue: venueData || null,
              artists: artistsData
                ? artistsData.map((item) => item.artist)
                : [],
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
  }, [debouncedSearchTerm, supabase]);

  return {
    searchTerm,
    setSearchTerm,
    concerts,
    isLoading,
    debouncedSearchTerm,
  };
}
