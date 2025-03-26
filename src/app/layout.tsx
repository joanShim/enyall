import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "엔열 ENYALL | 콘서트 리뷰 아카이브",
  description:
    "즐거웠던 시간을 기록하고 공유하는 콘서트 리뷰 아카이브 | 공연장 시야 정보 | 콘서트 후기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <html lang="ko">
          <body className={`${pretendard.variable} antialiased`}>
            <main className="relative mx-auto min-h-screen max-w-md pb-16 shadow-xl">
              {children}
            </main>
          </body>
        </html>
      </NuqsAdapter>
    </QueryProvider>
  );
}
