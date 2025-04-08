"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SignInWithKakao() {
  const handleSignIn = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 리다이렉트 URL 설정
      const redirectUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
        : "http://localhost:3000/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error("카카오 로그인에 실패했습니다");
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
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
