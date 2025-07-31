"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { userKeys } from "./useUser";

interface UserAvatar {
  avatarUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUserAvatar(): UserAvatar {
  const supabase = createClient();

  const {
    data: avatarUrl,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.avatar(),
    queryFn: async () => {
      try {
        // getSession 사용 (클라이언트에서는 안전함)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          return null;
        }

        // 사용자의 avatar_url만 조회
        const { data, error } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();

        if (error) {
          throw error;
        }

        return data?.avatar_url || null;
      } catch (error) {
        console.error("Error fetching avatar:", error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled: true, // 항상 활성화 (인증 상태는 queryFn 내에서 확인)
  });

  return {
    avatarUrl: avatarUrl || null,
    isLoading,
    error,
    refetch,
  };
}

// 프로필 이미지 업데이트를 위한 유틸리티 함수
export function useUpdateUserAvatar() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const updateAvatar = async (newAvatarUrl: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("인증된 사용자가 없습니다");
      }

      // 데이터베이스 업데이트
      const { error } = await supabase
        .from("users")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      // 캐시 즉시 업데이트
      queryClient.setQueryData(userKeys.avatar(), newAvatarUrl);

      // 관련 쿼리들 무효화 (사용자 프로필 정보 등)
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });

      return newAvatarUrl;
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  };

  return { updateAvatar };
}
