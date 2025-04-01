"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// 사용자 관련 쿼리 키
export const userKeys = {
  all: ["user"] as const,
  current: () => [...userKeys.all, "current"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  reviews: () => [...userKeys.all, "reviews"] as const,
  favorites: () => [...userKeys.all, "favorites"] as const,
  favoriteArtists: () => [...userKeys.all, "favoriteArtists"] as const,
};

// 기본 사용자 정보를 가져오는 훅
export function useUser() {
  const supabase = createBrowserSupabaseClient();

  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error("인증된 사용자를 찾을 수 없습니다");
      }

      return user;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
