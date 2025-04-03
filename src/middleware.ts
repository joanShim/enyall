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

// 미들웨어 로깅 함수
const logMiddleware = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH-MIDDLEWARE ${timestamp}] ${message}`, data ? data : "");
};

export const applyMiddlewareSupabaseClient = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  logMiddleware(`Middleware 시작: ${pathname}`);

  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    logMiddleware("Supabase 클라이언트 생성 중");
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
    logMiddleware("토큰 갱신 시도 - getUser 호출");
    const { data: userData, error: getUserError } =
      await supabase.auth.getUser();

    if (getUserError) {
      logMiddleware("getUser 오류 발생", {
        error: getUserError.message,
        status: getUserError.status,
      });
    } else {
      logMiddleware("getUser 성공", {
        hasUser: !!userData.user,
        userId: userData.user?.id,
        provider: userData.user?.app_metadata?.provider,
      });
    }

    return { response, supabase };
  } catch (error) {
    logMiddleware("미들웨어 Supabase 초기화 예외 발생", error);
    return { response, supabase: null };
  }
};

export async function middleware(request: NextRequest) {
  // 현재 요청 경로 가져오기
  const { pathname } = request.nextUrl;
  logMiddleware(`미들웨어 처리 시작: ${pathname}`);

  // ✅ 정적 자산 요청은 그대로 통과
  if (
    staticAssets.some(
      (asset) => pathname.startsWith(asset) || pathname === asset,
    )
  ) {
    logMiddleware("정적 자산 요청 - 통과");
    return NextResponse.next();
  }

  // /my 경로의 사용자 관련 경로인 경우에만 인증 확인
  const isUserPath = pathname.startsWith("/my") || pathname.startsWith("/new");
  logMiddleware(`경로 분석`, { isUserPath, pathname });

  // 인증 확인이 필요한 경로가 아니면 바로 통과
  if (!isUserPath && !pathname.startsWith("/auth")) {
    logMiddleware("인증 불필요 경로 - 통과");
    return NextResponse.next();
  }

  try {
    // 미들웨어 적용하여 응답 및 supabase 클라이언트 가져오기
    const { response, supabase } = await applyMiddlewareSupabaseClient(request);

    if (!supabase) {
      logMiddleware("Supabase 클라이언트 생성 실패 - 기본 응답 반환");
      return response;
    }

    // 사용자 세션 확인
    logMiddleware("세션 확인 시도");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      logMiddleware("세션 확인 오류 발생", {
        error: sessionError.message,
        status: sessionError.status,
      });
    }

    logMiddleware("세션 확인 결과", {
      hasSession: !!session,
      userId: session?.user?.id,
      provider: session?.user?.app_metadata?.provider,
    });

    // 리다이렉트 로직
    if (!session && isUserPath) {
      const redirectUrl = new URL("/auth/signIn", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      logMiddleware(
        "인증 필요 경로 접근, 세션 없음 - 로그인 페이지로 리다이렉트",
        {
          from: pathname,
          to: redirectUrl.toString(),
        },
      );
      return NextResponse.redirect(redirectUrl);
    }

    if (
      session &&
      (pathname === "/auth/signIn" || pathname === "/auth/signup")
    ) {
      const redirectUrl = new URL("/my", request.url);
      logMiddleware(
        "이미 로그인된 상태로 인증 페이지 접근 - 마이페이지로 리다이렉트",
        {
          from: pathname,
          to: redirectUrl.toString(),
        },
      );
      return NextResponse.redirect(redirectUrl);
    }

    logMiddleware("미들웨어 처리 완료 - 기본 응답 반환");
    return response;
  } catch (error) {
    logMiddleware("미들웨어 처리 중 예외 발생", error);
    return NextResponse.next();
  }
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
