import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && user) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";

      // const {
      //   data: { user },
      //   error,
      // } = await supabase.auth.getUser();

      // 신규 사용자인지 확인
      const { data: existingUser } = await supabase
        .from("users")
        .select()
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        // 신규 사용자는 추가 정보 입력 페이지로 리다이렉트
        return NextResponse.redirect(
          new URL("/auth/complete-profile", requestUrl.origin),
        );
      }

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
