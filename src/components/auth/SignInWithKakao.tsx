"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function SignInWithKakao() {
  const handleSignIn = async () => {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
          : "http://localhost:3000/auth/callback",
      },
    });

    if (error) {
      console.error("카카오 로그인 오류:", error);
    }
  };

  return (
    <section className="flex justify-center">
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
