"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import Image from "next/image";
import Link from "next/link";
import Favorites from "./Favorites";
import { Skeleton } from "@/components/ui/skeleton";

export function MyProfileSection() {
  const { profile, isLoading, favoriteArtists } = useUserProfile();

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center border-y px-3 py-4">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="mt-2 h-5 w-24" />
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="flex flex-col items-center justify-center border-y px-3 py-4">
        <div className="text-sm text-gray-500">프로필을 불러올 수 없습니다</div>
      </section>
    );
  }

  return (
    <section className="rel flex flex-col items-center justify-center border-y px-3 py-4">
      <div className="relative size-20 overflow-hidden rounded-full border">
        <Image
          src={profile.avatar_url}
          priority
          alt="프로필 이미지"
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <Link
        href="/my/profile-settings"
        className="text-md py-2 font-bold underline"
      >
        {profile.name}
      </Link>

      {/* 좋아하는 아티스트 섹션 */}
      {favoriteArtists.length > 0 && <Favorites artists={favoriteArtists} />}
    </section>
  );
}
