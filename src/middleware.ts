import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
// PWA 관련 파일 및 정적 자산
const staticAssets = [
  "/sw.js",
  "/manifest.json",
  "/offline.html",
  "/icons/",
  "/favicon.ico",
];

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

  // ✅ 정적 자산 요청은 그대로 통과
  if (
    staticAssets.some(
      (asset) => pathname.startsWith(asset) || pathname === asset,
    )
  ) {
    return NextResponse.next();
  }

  // /my 경로의 사용자 관련 경로인 경우에만 인증 확인
  const isUserPath = pathname.startsWith("/my") || pathname.startsWith("/new");

  // 인증 확인이 필요한 경로가 아니면 바로 통과
  if (!isUserPath && !pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // 미들웨어 적용하여 응답 및 supabase 클라이언트 가져오기
  const { response, supabase } = await applyMiddlewareSupabaseClient(request);

  // 사용자 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 리다이렉트 로직
  if (!session && isUserPath) {
    const redirectUrl = new URL("/auth/signIn", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && (pathname === "/auth/signIn" || pathname === "/auth/signup")) {
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
     * - 이미지 파일 확장자들 (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
