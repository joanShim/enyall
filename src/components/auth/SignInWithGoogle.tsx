"use client";

import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function SignInWithGoogle() {
  const handleSignIn = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 리다이렉트 URL 설정
      const redirectUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
        : "http://localhost:3000/auth/callback";


      const { data, error } = await supabase.auth.signInWithOAuth({
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
        console.error("[AUTH] 구글 로그인 오류:", error);
        console.error("[AUTH] 오류 세부 정보:", {
          code: error.code,
          message: error.message,
          status: error.status,
        });
      } else {
        console.log("[AUTH] 구글 OAuth 초기화 성공:", data);
        // 여기서는 리다이렉트가 일어나므로 실제로 이 로그는 보이지 않을 수 있음
      }
    } catch (e) {
      console.error("[AUTH] 구글 로그인 예외 발생:", e);
      if (error) {
        console.error("[AUTH] 구글 로그인 오류:", error);
        console.error("[AUTH] 오류 세부 정보:", {
          code: error.code,
          message: error.message,
          status: error.status,
        });
      } else {
        console.log("[AUTH] 구글 OAuth 초기화 성공:", data);
        // 여기서는 리다이렉트가 일어나므로 실제로 이 로그는 보이지 않을 수 있음
      }
    } catch (e) {
      console.error("[AUTH] 구글 로그인 예외 발생:", e);
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
