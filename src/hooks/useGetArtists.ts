"use client";

import { useState, useEffect, useCallback } from "react";
import { Artist } from "@/types/artist";
import { createClient } from "@/utils/supabase/client";

export function useGetArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchArtists = useCallback(async () => {
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
  }, [supabase]);

  // 첫 렌더링시 데이터 로드
  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // 데이터를 강제로 다시 불러오는 mutate 함수
  const mutate = useCallback(() => {
    fetchArtists();
  }, [fetchArtists]);

  return { artists, isLoading, error, mutate };
}
