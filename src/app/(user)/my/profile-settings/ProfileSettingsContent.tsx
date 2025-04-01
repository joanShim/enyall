"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useArtists } from "@/hooks/useArtists";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileForm } from "./ProfileForm";
import SignOutButton from "@/components/auth/SignOutButton";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSettingsContent() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { artists, isLoading: isArtistsLoading } = useArtists();

  const isLoading = isProfileLoading || isArtistsLoading;

  if (isLoading) {
    return (
      <section className="flex w-full flex-col items-center gap-6 p-4">
        <Skeleton className="size-32 rounded-full" />
        <div className="w-full space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </section>
    );
  }

  if (!profile) {
    return <div>사용자 프로필을 불러오는데 실패했습니다.</div>;
  }

  return (
    <section className="flex w-full flex-col items-center gap-6 p-4">
      <ProfileAvatar avatarUrl={profile.avatar_url} />
      <ProfileForm
        user={profile}
        artists={artists}
        userFavorites={profile.favorites || []}
      />
      <SignOutButton />
    </section>
  );
}
