"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserAvatar } from "@/hooks/useUserAvatar";

const navItems = [
  {
    label: "피드",
    href: "/feed",
    icon: Globe,
  },
  {
    label: "검색",
    href: "/browse",
    icon: Search,
  },
];

export default function TabBar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { avatarUrl, isLoading: avatarLoading } = useUserAvatar();

  // 로딩 중일 때는 기본 UI 표시
  if (isLoading) {
    return (
      <nav className="bottom-tabs-padding fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around border-t bg-white px-2 py-4">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-full w-full flex-col items-center justify-center"
            >
              <IconComponent size={20} className="text-gray-500" />
              <span className="mt-1 text-xs">{item.label}</span>
            </Link>
          );
        })}
        <div className="flex h-full w-full flex-col items-center justify-center">
          <User size={20} className="text-gray-500" />
          <span className="mt-1 text-xs">로그인</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bottom-tabs-padding fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-around border-t bg-white px-2 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-full w-full flex-col items-center justify-center ${
              isActive ? "font-bold" : "font-normal"
            }`}
          >
            <IconComponent
              size={20}
              strokeWidth={isActive ? 2.5 : 2}
              className={isActive ? "text-primary" : "text-gray-500"}
            />
            <span className="mt-1 text-xs">{item.label}</span>
          </Link>
        );
      })}

      {user ? (
        <Link
          href="/my"
          className={`flex h-full w-full flex-col items-center justify-center ${
            pathname === "/my" ? "font-bold" : "font-normal"
          }`}
        >
          <div
            className={`relative h-5 w-5 overflow-hidden rounded-full border ${
              pathname === "/my" ? "border-2" : "border-1"
            }`}
          >
            {avatarUrl && !avatarLoading ? (
              <Image
                src={avatarUrl}
                alt="프로필 이미지"
                fill
                sizes="20px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-gray-200" />
            )}
          </div>
          <span className="mt-1 text-xs">마이</span>
        </Link>
      ) : (
        <Link
          href="/auth/signIn"
          className="flex h-full w-full flex-col items-center justify-center"
        >
          <User size={20} className="text-gray-500" />
          <span className="mt-1 text-xs">로그인</span>
        </Link>
      )}
    </nav>
  );
}
