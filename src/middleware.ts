import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// 공개 경로 (로그인 여부와 상관없이 접근 가능한 경로)
const publicPaths = ["/auth/signIn", "/auth/signup", "/auth/callback"];

export const applyMiddlewareSupabaseClient = async (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Array.from(request.cookies.getAll()).map(
            ({ name, value }) => ({
              name,
              value,
            }),
          );
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    },
  );

  // refreshing the auth token
  await supabase.auth.getUser();

  return { response, supabase };
};

export async function middleware(request: NextRequest) {
  // 현재 요청 경로 가져오기
  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.includes(pathname);

  // 미들웨어 적용하여 응답 및 supabase 클라이언트 가져오기
  const { response, supabase } = await applyMiddlewareSupabaseClient(request);

  // 사용자 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 리다이렉트 로직
  if (!session && !isPublicPath) {
    const redirectUrl = new URL("/auth/signIn", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL("/my", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
