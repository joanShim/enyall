"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

type Venue = {
  id: string;
  name: string;
  address: string;
};

export function useGetVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchVenues = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("venues")
        .select("id, name, address")
        .order("name");

      if (error) throw new Error(error.message);

      setVenues(data || []);
    } catch (err) {
      console.error("공연장 목록을 불러오는데 실패했습니다:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("공연장 목록을 불러오는데 실패했습니다"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // 첫 렌더링시 데이터 로드
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // 데이터를 강제로 다시 불러오는 mutate 함수
  const mutate = useCallback(() => {
    fetchVenues();
  }, [fetchVenues]);

  return { venues, isLoading, error, mutate };
}
