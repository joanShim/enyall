"use client";

import { useState, useRef } from "react";
import { updateUserProfile } from "@/actions/update-profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArtistSelector } from "./ArtistSelector";
import { Artist } from "@/types/artist";
import { Badge } from "@/components/ui/badge";

interface ProfileFormProps {
  user: User;
  artists: Artist[];
  userFavorites: string[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "저장 중..." : "프로필 저장"}
    </Button>
  );
}

export default function ProfileForm({
  user,
  artists,
  userFavorites,
}: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState(user.user_metadata.name || "");

  // 사용자의 즐겨찾기 아티스트 ID를 기반으로 초기 선택된 아티스트 설정
  const initialSelectedArtists = artists.filter((artist) =>
    userFavorites.includes(artist.id),
  );

  const [selectedArtists, setSelectedArtists] = useState<Artist[]>(
    initialSelectedArtists,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const avatarUrl = user.user_metadata.avatar_url;
  const email = user.email;

  const handleRemoveArtist = (artistId: string) => {
    setSelectedArtists((prevArtists) =>
      prevArtists.filter((artist) => artist.id !== artistId),
    );
  };

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        // 선택된 아티스트 ID를 폼 데이터에 추가
        selectedArtists.forEach((artist) => {
          formData.append("selectedArtists", artist.id);
        });

        const result = await updateUserProfile(formData);

        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          router.push("/my");
        }
      }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* 프로필 이미지 표시 */}
      {avatarUrl && (
        <div className="flex justify-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border">
            <Image
              src={avatarUrl}
              alt="프로필 이미지"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* 이메일 표시 */}
      {email && (
        <div className="text-center text-sm text-gray-500">{email}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">닉네임</Label>
        <Input
          id="name"
          name="name"
          placeholder="닉네임을 입력해주세요"
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 아티스트 선택 컴포넌트 */}
      <ArtistSelector
        initialSelectedArtists={selectedArtists}
        onChange={setSelectedArtists}
        maxSelections={5}
        artists={artists}
      />

      {/* 선택된 아티스트 뱃지 */}
      {selectedArtists.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedArtists.map((artist) => (
            <Badge
              key={artist.id}
              variant="outline"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleRemoveArtist(artist.id)}
            >
              {artist.name_ko || artist.name_official}
            </Badge>
          ))}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
