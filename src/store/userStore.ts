import { create } from "zustand";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";

// 로깅 함수
const logStore = (message: string, data?: unknown) => {
  console.log(`[AUTH-STORE] ${message}`, data ? data : '');
};

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
    logStore('프로필 정보 로드 시작');
    const supabase = createBrowserSupabaseClient();

    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logStore('인증된 사용자 없음');
        set({ userProfile: null, isLoading: false });
        return;
      }

      logStore('사용자 인증 확인됨', { userId: user.id });

      // 사용자 프로필 정보 가져오기
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        logStore('프로필 정보 로드 오류', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        throw error;
      }

      logStore('프로필 정보 로드 성공', { hasProfile: !!profile });
      set({ userProfile: profile, isLoading: false });
    } catch (error) {
      console.error("사용자 프로필 정보를 불러오는데 실패했습니다:", error);
      logStore('프로필 정보 로드 예외 발생', error);
      set({
        error: "사용자 정보를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  clearUserProfile: () => {
    logStore('프로필 정보 초기화');
    set({ userProfile: null, error: null });
  },
}));
