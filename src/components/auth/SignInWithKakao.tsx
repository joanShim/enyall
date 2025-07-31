"use client";

import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SignInWithKakao() {
  const handleSignIn = async () => {
    try {
      const supabase = createClient();
      // 현재 접속한 주소를 기반으로 리다이렉트 URL 설정
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/auth/callback`;

      console.log("redirectUrl", redirectUrl);

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
