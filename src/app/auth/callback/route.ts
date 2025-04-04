import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createServerSupabaseClient } from "@/utils/supabase/server";

// 서버 사이드 로깅 함수
const logAuth = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH-CALLBACK ${timestamp}] ${message}`, data ? data : "");
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const origin = requestUrl.origin;

  logAuth(`OAuth 콜백 시작 - URL: ${requestUrl.toString()}`);
  logAuth(`Code 존재 여부: ${!!code}, Next 경로: ${next}`);

  if (code) {
    try {
      logAuth("Supabase 클라이언트 생성 중");
      const supabase = await createServerSupabaseClient();

      logAuth("Code를 세션으로 교환 시작");
      const {
        error,
        data: { user },
      } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        logAuth("세션 교환 중 오류 발생", {
          error: error.message,
          code: error.code,
          status: error.status,
        });
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      if (!user) {
        logAuth("세션 교환 성공했으나 사용자 정보 없음");
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      logAuth("세션 교환 성공, 사용자 정보 확인됨", {
        userId: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      logAuth("환경 정보", {
        forwardedHost,
        isLocalEnv,
        nodeEnv: process.env.NODE_ENV,
      });

      // users 테이블 확인 로직 (온보딩 완료 여부 확인)
      logAuth("사용자 테이블 확인 중", { userId: user.id });

      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("is_onboarding_completed")
        .eq("id", user.id)
        .single();

      if (userError) {
        logAuth("사용자 테이블 조회 오류", {
          error: userError.message,
          code: userError.code,
          details: userError.details,
        });
      }

      logAuth("사용자 테이블 조회 결과", {
        exists: !!existingUser,
        onboardingCompleted: existingUser?.is_onboarding_completed,
      });

      if (existingUser && !existingUser.is_onboarding_completed) {
        // 온보딩이 완료되지 않은 경우 프로필 설정 페이지로 리다이렉트
        const redirectUrl = new URL("/my/profile-settings", requestUrl.origin);
        logAuth("온보딩 미완료 - 프로필 설정 페이지로 리다이렉트", {
          redirectUrl: redirectUrl.toString(),
        });
        return NextResponse.redirect(redirectUrl);
      } else {
        // 온보딩이 완료되었거나, 새 계정이지만 트리거로 users 레코드가 아직 생성되지 않은 경우
        let redirectUrl;

        if (isLocalEnv) {
          redirectUrl = `${origin}${next}`;
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`;
        } else {
          redirectUrl = `${origin}${next}`;
        }

        logAuth("인증 및 온보딩 완료 - 리다이렉트", { redirectUrl });
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err) {
      logAuth("예상치 못한 예외 발생", err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  // code가 없는 경우 오류 페이지로 리다이렉트
  logAuth("인증 코드 없음 - 오류 페이지로 리다이렉트");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
