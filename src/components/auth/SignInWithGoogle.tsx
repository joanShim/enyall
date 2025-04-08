"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SignInWithGoogle() {
  const handleSignIn = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 리다이렉트 URL 설정
      const redirectUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
        : "http://localhost:3000/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        toast.error("구글 로그인에 실패했습니다");
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full bg-white text-gray-900"
      onClick={handleSignIn}
    >
      구글로 로그인
    </Button>
  );
}
