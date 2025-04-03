"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/userStore";
import { Tables } from "@/types/db";
import { Artist } from "@/types/artist";
import { useUser, userKeys } from "./useUser";

// 로깅 함수
const logProfileHook = (message: string, data?: unknown) => {
  console.log(`[AUTH-PROFILE-HOOK] ${message}`, data ? data : "");
};

export function useUserProfile() {
  const { userProfile } = useUserStore();
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useUser();

  // 사용자 프로필 조회 쿼리
  const profileQuery = useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      logProfileHook("프로필 조회 시작");

      // 스토어에 이미 프로필이 있으면 사용
      if (userProfile) {
        logProfileHook("스토어에서 프로필 발견", { userId: userProfile.id });
        return userProfile;
      }

      if (!user) {
        logProfileHook("사용자 인증 정보 없음");
        throw new Error("인증된 사용자가 필요합니다");
      }

      logProfileHook("DB에서 프로필 조회 시도", { userId: user.id });

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          logProfileHook("프로필 조회 오류", {
            message: error.message,
            code: error.code,
            details: error.details,
          });
          throw new Error("프로필 로딩에 실패했습니다");
        }

        logProfileHook("프로필 조회 성공", {
          userId: data.id,
          hasProfile: !!data,
        });

        return data;
      } catch (err) {
        logProfileHook("프로필 조회 예외 발생", err);
        throw err;
      }
    },
    enabled: !isUserLoading && !!user,
    retry: 1,
  });

  // 관심 아티스트 목록 조회 쿼리
  const favoriteArtistsQuery = useQuery({
    queryKey: userKeys.favoriteArtists(),
    queryFn: async () => {
      const userId = profileQuery.data?.id;
      logProfileHook("관심 아티스트 조회 시작", { userId });

      if (!userId) {
        logProfileHook("사용자 ID 없음");
        throw new Error("사용자 ID를 찾을 수 없습니다");
      }

      const favorites = profileQuery.data?.favorites || [];
      logProfileHook("관심 아티스트 ID 목록", { count: favorites.length });

      if (favorites.length === 0) return [];

      try {
        const { data, error } = await supabase
          .from("artists")
          .select("*")
          .in("id", favorites);

        if (error) {
          logProfileHook("아티스트 조회 오류", {
            message: error.message,
            code: error.code,
          });
          throw new Error("아티스트 정보 로딩에 실패했습니다");
        }

        logProfileHook("아티스트 조회 성공", { count: data.length });
        return data as Artist[];
      } catch (err) {
        logProfileHook("아티스트 조회 예외 발생", err);
        throw err;
      }
    },
    enabled: !!profileQuery.data?.id && !!profileQuery.data?.favorites,
  });

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<Tables<"users">>) => {
      logProfileHook("프로필 업데이트 시작", profileData);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          logProfileHook("프로필 업데이트 실패 - 사용자 없음");
          throw new Error("인증된 사용자를 찾을 수 없습니다");
        }

        const { data, error } = await supabase
          .from("users")
          .update(profileData)
          .eq("id", user.id)
          .select("*")
          .single();

        if (error) {
          logProfileHook("프로필 업데이트 오류", {
            message: error.message,
            code: error.code,
          });
          throw new Error("프로필 업데이트에 실패했습니다");
        }

        logProfileHook("프로필 업데이트 성공", { userId: data.id });
        return data;
      } catch (err) {
        logProfileHook("프로필 업데이트 예외 발생", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // 쿼리 캐시 업데이트
      queryClient.setQueryData(userKeys.profile(), data);

      // 사용자 스토어 업데이트
      useUserStore.getState().fetchUserProfile();
      logProfileHook("프로필 업데이트 후 스토어 갱신");
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    favoriteArtists: favoriteArtistsQuery.data || [],
    isFavoriteArtistsLoading: favoriteArtistsQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
    isPending: updateProfileMutation.isPending,
  };
}
