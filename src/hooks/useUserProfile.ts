"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/userStore";
import { Tables } from "@/types/db";
import { Artist } from "@/types/artist";
import { useUser, userKeys } from "./useUser";

export function useUserProfile() {
  const { userProfile } = useUserStore();
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useUser();

  // 사용자 프로필 조회 쿼리
  const profileQuery = useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      // 스토어에 이미 프로필이 있으면 사용
      if (userProfile) {
        return userProfile;
      }

      if (!user) {
        throw new Error("인증된 사용자가 필요합니다");
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw new Error("프로필 로딩에 실패했습니다");
        }

        return data;
      } catch (err) {
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

      if (!userId) {
        throw new Error("사용자 ID를 찾을 수 없습니다");
      }

      const favorites = profileQuery.data?.favorites || [];

      if (favorites.length === 0) return [];

      try {
        const { data, error } = await supabase
          .from("artists")
          .select("*")
          .in("id", favorites);

        if (error) {
          throw new Error("아티스트 정보 로딩에 실패했습니다");
        }

        return data as Artist[];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!profileQuery.data?.id && !!profileQuery.data?.favorites,
  });

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<Tables<"users">>) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("인증된 사용자를 찾을 수 없습니다");
        }

        const { data, error } = await supabase
          .from("users")
          .update(profileData)
          .eq("id", user.id)
          .select("*")
          .single();

        if (error) {
          throw new Error("프로필 업데이트에 실패했습니다");
        }

        return data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (data) => {
      // 쿼리 캐시 업데이트
      queryClient.setQueryData(userKeys.profile(), data);

      // 사용자 스토어 업데이트
      useUserStore.getState().fetchUserProfile();
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
