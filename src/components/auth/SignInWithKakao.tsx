"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function SignInWithKakao() {
  const handleSignIn = async () => {
    const supabase = createBrowserSupabaseClient();

    // 현재 URL의 origin을 가져와서 리다이렉트 URL 생성
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("카카오 로그인 오류:", error);
    }
  };

  return (
    <section className="flex w-full justify-center">
      <Button
        // variant="outline"
        className="bg-[#fee601] text-[#191500]"
        onClick={handleSignIn}
      >
        카카오로 로그인
      </Button>
    </section>
  );
}
