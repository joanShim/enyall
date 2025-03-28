"use client";

import { useState, useRef } from "react";
import { updateUserProfile } from "@/actions/update-profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { ArtistSelector } from "./ArtistSelector";
import { Artist } from "@/types/artist";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/db";
import { toast } from "sonner";

interface ProfileFormProps {
  user: Database["public"]["Tables"]["users"]["Row"];
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

export function ProfileForm({
  user,
  artists,
  userFavorites,
}: ProfileFormProps) {
  const [nickname, setNickname] = useState(user.name || "");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const email = user.email;

  // 사용자의 즐겨찾기 아티스트 ID를 기반으로 초기 선택된 아티스트 설정
  const initialSelectedArtists = artists.filter((artist) =>
    userFavorites.includes(artist.id),
  );
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>(
    initialSelectedArtists,
  );

  const handleRemoveArtist = (artistId: string) => {
    setSelectedArtists((prevArtists) =>
      prevArtists.filter((artist) => artist.id !== artistId),
    );
  };

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        selectedArtists.forEach((artist) => {
          formData.append("selectedArtists", artist.id);
        });

        const result = await updateUserProfile(formData);

        if (result?.error) {
          toast.error(result.error);
        } else if (result?.success) {
          toast.success("프로필이 성공적으로 업데이트되었습니다.");
          router.push("/my");
        }
      }}
      className="w-full space-y-6"
    >
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

      <ArtistSelector
        initialSelectedArtists={selectedArtists}
        onChange={setSelectedArtists}
        maxSelections={5}
        artists={artists}
      />

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
