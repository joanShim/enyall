import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import TabBar from "@/components/layout/TabBar";
import { GoogleAnalytics } from "@next/third-parties/google";
import ServiceWorker from "@/components/layout/ServiceWorker";
import { Toaster } from "sonner";
import AuthChangeListener from "@/components/auth/AuthChangeListener";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "엔열 ENYALL | 콘서트 리뷰 아카이브",
  description:
    "즐거웠던 시간을 기록하고 공유하는 콘서트 리뷰 아카이브 | 공연장 시야 정보 | 콘서트 후기",
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <QueryProvider>
      <NuqsAdapter>
        <html lang="ko">
          <head></head>
          <body className={`${pretendard.variable} antialiased`}>
            <ServiceWorker />
            <main className="relative mx-auto h-full min-h-dvh max-w-md pb-16 shadow-xl">
              {children}
            </main>
            <TabBar />
            <Toaster position="bottom-center" />
            <AuthChangeListener />
            {gaId && <GoogleAnalytics gaId={gaId} />}
          </body>
        </html>
      </NuqsAdapter>
    </QueryProvider>
  );
}
