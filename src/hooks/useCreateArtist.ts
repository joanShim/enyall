"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Artist } from "@/types/artist";
import { artistKeys } from "./useArtists";

export function useCreateArtist() {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<Artist> => {
      const { data, error } = await supabase
        .from("artists")
        .insert([{ name_official: name }])
        .select()
        .single();

      if (error)
        throw new Error("아티스트 추가에 실패했습니다: " + error.message);
      if (!data) throw new Error("아티스트 추가 후 데이터를 받지 못했습니다.");

      return data as Artist;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_) => {
      // 아티스트가 추가되면 useArtists 훅의 캐시를 무효화하여 최신 목록을 가져오도록 함
      queryClient.invalidateQueries({
        queryKey: artistKeys.list(),
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("Artist creation mutation error:", error);
    },
  });
}
