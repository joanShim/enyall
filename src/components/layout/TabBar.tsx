"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";

const navItems = [
  {
    label: "피드",
    href: "/feed",
    icon: Home,
  },
  {
    label: "검색",
    href: "/browse",
    icon: Search,
  },
];

export default function TabBar() {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<Tables<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  const getUserData = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // DB에서 사용자 프로필 정보 가져오기
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      setUserProfile(profile);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-16 max-w-md items-center justify-around border-t bg-white px-2">
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

      {isLoading ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="size-5 animate-pulse rounded-full bg-gray-200" />
          <span className="mt-1 text-xs">마이</span>
        </div>
      ) : userProfile ? (
        <Link
          href="/my"
          className={`flex h-full w-full flex-col items-center justify-center ${
            pathname === "/my" ? "font-bold" : "font-normal"
          }`}
        >
          {userProfile.avatar_url ? (
            <div
              className={`relative h-5 w-5 overflow-hidden rounded-full border ${
                pathname === "/my" ? "border-2" : "border-1"
              }`}
            >
              <Image
                src={userProfile.avatar_url}
                alt="프로필 이미지"
                fill
                sizes="20px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="size-5 rounded-full border bg-gray-200" />
          )}
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
