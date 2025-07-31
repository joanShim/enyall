"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Artist } from "@/types/artist";

// 쿼리 키 상수
export const artistKeys = {
  all: ["artists"] as const,
  list: () => [...artistKeys.all, "list"] as const,
};

export function useArtists() {
  const supabase = createClient();

  const query = useQuery({
    queryKey: artistKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("name_official");

      if (error) throw new Error("아티스트 목록을 불러오는데 실패했습니다");
      return data as Artist[];
    },
    staleTime: 5 * 60 * 1000, // 5분 캐싱 (아티스트 목록은 자주 변경되지 않음)
  });

  return {
    artists: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
