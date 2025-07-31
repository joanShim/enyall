"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function SignOutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    try {
      // 1. Supabase에서 로그아웃
      const supabase = createClient();
      await supabase.auth.signOut();

      // 2. React Query 캐시 초기화 (모든 사용자 관련 데이터)
      queryClient.clear();

      // 3. 로그인 페이지로 리다이렉트
      router.push("/auth/signIn");
      router.refresh();
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <>
      <Button variant="link" className="text-gray-500" onClick={handleSignOut}>
        로그아웃
      </Button>
    </>
  );
}
