"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";

export default function TabBar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createBrowserSupabaseClient();
  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
  };

  useEffect(() => {
    getSession();
  }, [supabase.auth]);

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-16 max-w-md items-center justify-around border-t-2 bg-white px-2">
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
      <Link
        href="/my"
        className={`flex h-full w-full flex-col items-center justify-center ${
          pathname === "/my" ? "font-bold" : "font-normal"
        }`}
      >
        {session?.user?.user_metadata?.avatar_url ? (
          <div
            className={`relative h-5 w-5 overflow-hidden rounded-full border ${
              pathname === "/my" ? "border-2" : "border-1"
            }`}
          >
            <Image
              src={session.user.user_metadata.avatar_url}
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
    </nav>
  );
}
