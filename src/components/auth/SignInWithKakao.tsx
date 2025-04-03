"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function SignInWithKakao() {
  const handleSignIn = async () => {
    console.log("[AUTH] 카카오 로그인 시작");
    
    try {
      const supabase = createBrowserSupabaseClient();
     
    // 현재 URL의 origin을 가져와서 리다이렉트 URL 생성
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo,
      },
    });

      if (error) {
        console.error("[AUTH] 카카오 로그인 오류:", error);
        console.error("[AUTH] 오류 세부 정보:", {
          code: error.code,
          message: error.message,
          status: error.status
        });
      } else {
        console.log("[AUTH] 카카오 OAuth 초기화 성공:", data);
        // 여기서는 리다이렉트가 일어나므로 실제로 이 로그는 보이지 않을 수 있음
      }
    } catch (e) {
      console.error("[AUTH] 카카오 로그인 예외 발생:", e);
    }
  };

  return (
    <section className="flex w-full justify-center">
      <Button
        // variant="outline"
        className="w-full bg-[#fee601] text-[#191500]"
        onClick={handleSignIn}
      >
        카카오로 로그인
      </Button>
    </section>
  );
}
