"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function SignInWithKakao() {
  const handleSignIn = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 리다이렉트 URL 설정
      const redirectUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
        : "http://localhost:3000/auth/callback";


      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("[AUTH] 카카오 로그인 오류:", error);
        console.error("[AUTH] 오류 세부 정보:", {
          code: error.code,
          message: error.message,
          status: error.status,
        });
      } else {
        console.log("[AUTH] 카카오 OAuth 초기화 성공:", data);
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
