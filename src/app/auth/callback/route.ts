import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/my";
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  try {
    const supabase = await createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !user) {
      throw error || new Error("User data not found");
    }

    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("is_onboarding_completed")
      .eq("id", user.id)
      .single();

    if (userError) {
      throw userError;
    }

    // 온보딩이 완료되지 않은 경우 프로필 설정으로 리다이렉트
    if (existingUser && !existingUser.is_onboarding_completed) {
      return NextResponse.redirect(
        new URL("/my/profile-settings", requestUrl.origin),
      );
    }

    // 현재 요청의 origin을 사용하여 리다이렉트 URL 설정
    const redirectUrl = `${origin}${next}`;

    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}
