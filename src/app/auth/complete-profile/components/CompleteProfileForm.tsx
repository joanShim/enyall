"use client";

import { useState } from "react";
import { completeUserProfile } from "@/actions/complete-profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CompleteProfileFormProps {
  user: User;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "저장 중..." : "프로필 저장"}
    </Button>
  );
}

export default function CompleteProfileForm({
  user,
}: CompleteProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const avatarUrl = user.user_metadata.avatar_url;
  const email = user.email;

  return (
    <form
      action={async (formData) => {
        const result = await completeUserProfile(formData);

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
          defaultValue={""}
        />
      </div>

      <SubmitButton />
    </form>
  );
}
