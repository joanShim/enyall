"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";
import { Artist } from "@/types/artist";
import { useUser, userKeys } from "./useUser";

export function useUserProfile() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useUser();

  // 사용자 프로필 조회 쿼리
  const profileQuery = useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
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
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
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
    enabled: !!profileQuery.data?.id,
    staleTime: 0,
    placeholderData: (previousData) => previousData || [],
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
      // 프로필 쿼리 데이터 즉시 업데이트
      queryClient.setQueryData(userKeys.profile(), data);

      // favoriteArtists 쿼리 무효화 및 다시 가져오기
      queryClient.invalidateQueries({
        queryKey: userKeys.favoriteArtists(),
        refetchType: "active",
      });

      // 아바타 쿼리도 무효화 (프로필 이미지가 변경될 수 있음)
      queryClient.invalidateQueries({
        queryKey: userKeys.avatar(),
        refetchType: "active",
      });
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
