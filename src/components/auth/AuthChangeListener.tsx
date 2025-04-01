"use client";

import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/userStore";

export default function AuthChangeListener() {
  const { fetchUserProfile, clearUserProfile } = useUserStore();

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // 초기 사용자 정보 가져오기
    fetchUserProfile();

    // 인증 상태 변화 리스너 설정
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchUserProfile();
      } else if (event === "SIGNED_OUT") {
        clearUserProfile();
      }
    });

    // 클린업 함수
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, clearUserProfile]);

  return null;
}
