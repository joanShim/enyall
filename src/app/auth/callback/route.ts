import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createServerSupabaseClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // users 테이블 확인 로직 (온보딩 완료 여부 확인)
      const { data: existingUser } = await supabase
        .from("users")
        .select("is_onboarding_completed")
        .eq("id", user.id)
        .single();

      if (existingUser && !existingUser.is_onboarding_completed) {
        // 온보딩이 완료되지 않은 경우 프로필 설정 페이지로 리다이렉트
        return NextResponse.redirect(
          new URL("/my/profile-settings", requestUrl.origin),
        );
      } else {
        // 온보딩이 완료되었거나, 새 계정이지만 트리거로 users 레코드가 아직 생성되지 않은 경우
        // (트리거 실행 타이밍에 따라 드물게 발생할 수 있음)
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    }
  }

  // 오류 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
