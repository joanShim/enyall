"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { updateProfileImage } from "@/actions/update-profile-actions";
import { toast } from "sonner";

interface ProfileAvatarProps {
  avatarUrl: string;
}

export function ProfileAvatar({ avatarUrl }: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      setIsUploading(true);

      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("파일 크기는 5MB 이하여야 합니다.");
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        throw new Error("이미지 파일만 업로드 가능합니다.");
      }

      const response = await fetch(`/api/avatar/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "이미지 업로드에 실패했습니다.");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // 이미지 URL을 상태로 업데이트
      setCurrentAvatarUrl(data.url);

      // users 테이블의 avatar_url 업데이트
      const result = await updateProfileImage(data.url);
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("프로필 이미지가 업데이트되었습니다.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.",
      );
      // 에러 발생 시 이전 이미지로 복원
      setCurrentAvatarUrl(avatarUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-32">
        <Image
          src={currentAvatarUrl}
          alt="프로필 이미지"
          fill
          className="rounded-full border object-cover"
        />
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isUploading}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isUploading}
        onClick={handleButtonClick}
      >
        {isUploading ? "업로드 중..." : "프로필 이미지 변경"}
      </Button>
    </div>
  );
}
