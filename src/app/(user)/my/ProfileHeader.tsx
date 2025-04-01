"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileHeader() {
  const { profile, isLoading } = useUserProfile();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-3 pb-4 pt-4">
      {isLoading ? (
        <Skeleton className="h-8 w-40" />
      ) : (
        <h1 className="text-2xl font-bold">{profile?.name || "마이페이지"}</h1>
      )}
    </header>
  );
}
