"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, Search, User } from "lucide-react";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

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
  const { avatarUrl, setAvatarUrl } = useUserAvatar();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const fetchAvatar = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    const checkAuthAndFetchAvatar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);

      if (user) {
        fetchAvatar();
      }
    };

    // 초기 인증 상태 확인
    checkAuthAndFetchAvatar();

    // 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        fetchAvatar();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAvatarUrl]);

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

      {isAuthenticated ? (
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
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt="프로필 이미지"
                fill
                sizes="20px"
                className="object-cover"
              />
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
