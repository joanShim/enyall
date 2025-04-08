import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
// PWA 관련 파일 및 정적 자산
// const staticAssets = [
//   "/sw.js",
//   "/manifest.json",
//   "/offline.html",
//   "/icons/",
//   "/favicon.ico",
// ];

export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
