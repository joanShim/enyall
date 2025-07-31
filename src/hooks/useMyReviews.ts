"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Review } from "@/types/review";
import { useUser, userKeys } from "./useUser";

// 쿼리 키 상수
export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  myReviews: () => [...reviewKeys.lists(), "my"] as const,
};

export function useMyReviews() {
  const supabase = createClient();
  const { data: user, isLoading: isUserLoading } = useUser();

  const query = useQuery<Review[], Error>({
    queryKey: [...userKeys.reviews(), "my"],
    queryFn: async () => {
      if (!user) throw new Error("인증된 사용자가 필요합니다");

      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id, content, rating, created_at,
          concert:concert_id (
            id, title, poster_url, artists_json,
            venue:venue_id (id, name, address),
            concert_schedules (schedule_date, start_time)
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error("리뷰 목록을 불러오는데 실패했습니다");

      return data.map((review) => ({
        ...review,
        concert: Array.isArray(review.concert)
          ? review.concert[0]
          : review.concert,
      })) as unknown as Review[];
    },
    enabled: !isUserLoading && !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    reviews: query.data || [],
    isLoading: isUserLoading || query.isLoading,
    error: query.error,
    isEmpty: query.data?.length === 0,
  };
}
