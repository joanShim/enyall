"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

type Concert = {
  id: string;
  title: string;
  venue_id: string;
};

export function useGetConcerts(artistId: string | null) {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function fetchConcerts() {
      if (!artistId) {
        setConcerts([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 여기서는 아티스트와 콘서트를 연결하는 테이블이 필요합니다.
        // 현재 DB 구조에서는 이 관계가 명확하지 않으므로 임시로 구현합니다.
        // 실제 구현 시에는 DB 구조에 맞게 수정해야 합니다.
        const { data, error } = await supabase
          .from("concerts")
          .select("id, title, venue_id")
          // 아티스트와 콘서트를 연결하는 관계가 있다면 여기에 조건 추가
          // .eq('artist_id', artistId)
          .order("title");

        if (error) throw new Error(error.message);

        setConcerts(data || []);
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
