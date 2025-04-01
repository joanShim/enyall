import { create } from "zustand";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";

interface UserState {
  userProfile: Tables<"users"> | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: () => Promise<void>;
  clearUserProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userProfile: null,
  isLoading: false,
  error: null,

  fetchUserProfile: async () => {
    const supabase = createBrowserSupabaseClient();

    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ userProfile: null, isLoading: false });
        return;
      }

      // 사용자 프로필 정보 가져오기
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      set({ userProfile: profile, isLoading: false });
    } catch (error) {
      console.error("사용자 프로필 정보를 불러오는데 실패했습니다:", error);
      set({
        error: "사용자 정보를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  clearUserProfile: () => {
    set({ userProfile: null, error: null });
  },
}));
