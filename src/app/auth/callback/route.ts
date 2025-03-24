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

      // 사용자가 users 테이블에 존재하는지 확인
      const { data: existingUser } = await supabase
        .from("users")
        .select()
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        // 신규 사용자는 기본 정보를 users 테이블에 저장
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          name:
            user.user_metadata.name || user.email?.split("@")[0] || "사용자",
          avatar_url: user.user_metadata.avatar_url || null,
          favorites: [], // 빈 배열로 초기화
        });

        if (insertError) {
          console.error("사용자 정보 저장 실패:", insertError);
        }

        // 최초 가입자는 프로필 설정 페이지로 리다이렉트
        return NextResponse.redirect(
          new URL("/my/profile-settings", requestUrl.origin),
        );
      }

      // 정상 로그인 처리 및 리다이렉트
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 오류 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
