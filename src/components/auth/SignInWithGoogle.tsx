"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function SignInWithGoogle() {
  const handleSignIn = async () => {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
          : "http://localhost:3000/auth/callback",
      },
    });

    if (error) {
      console.error("구글 로그인 오류:", error);
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
