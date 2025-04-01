"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Review } from "@/types/review";

// 피드 쿼리 키
export const feedKeys = {
  all: ["feed"] as const,
  list: () => [...feedKeys.all, "list"] as const,
  detail: (id: string) => [...feedKeys.list(), id] as const,
};

export function useFeed() {
  const supabase = createBrowserSupabaseClient();

  const query = useQuery<Review[], Error>({
    queryKey: feedKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
        id,
        content,
        rating,
        images,
        created_at,
        user_id,
        concert:concert_id (
          id,
          title,
          poster_url,
          artists_json,
          venue:venue_id (
            id,
            name,
            address
          ),
          concert_schedules (
            schedule_date,
            start_time
          )
        )
      `,
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (error)
        throw new Error("피드를 불러오는데 실패했습니다: " + error.message);

      return data.map((review) => ({
        ...review,
        concert: Array.isArray(review.concert)
          ? review.concert[0]
          : review.concert,
      })) as unknown as Review[];
    },
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    reviews: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    isEmpty: query.data?.length === 0,
    refetch: query.refetch,
  };
}
