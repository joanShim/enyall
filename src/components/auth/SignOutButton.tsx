"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/userStore";
import { useQueryClient } from "@tanstack/react-query";

export default function SignOutButton() {
  const router = useRouter();
  const clearUserProfile = useUserStore((state) => state.clearUserProfile);
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    // 1. Supabase에서 로그아웃
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();

    // 2. React Query 캐시 초기화
    queryClient.clear();

    // 3. Zustand 스토어 초기화
    clearUserProfile();

    // 4. 로그인 페이지로 리다이렉트
    router.push("/auth/signIn");
    router.refresh();
  };

  return (
    <>
      <Button variant="link" className="text-gray-500" onClick={handleSignOut}>
        로그아웃
      </Button>
    </>
  );
}
