"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

// 아티스트 목록
export async function getArtists() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("name_official");

  if (error) {
    return { error: "아티스트 목록을 불러오는데 실패했습니다." };
  }

  return { artists: data };
}

// 프로필 이미지 업데이트
export async function updateProfileImage(avatarUrl: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "인증된 사용자를 찾을 수 없습니다." };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) {
      return { error: "프로필 이미지 업데이트에 실패했습니다." };
    }

    // 프로필 관련 모든 경로 revalidate
    revalidatePath("/", "layout");
    revalidatePath("/my", "layout");
    revalidatePath("/feed", "layout");
    revalidatePath("/browse", "layout");

    // 프로필 관련 태그 revalidate
    revalidateTag("user-profile");
    revalidateTag("user-avatar");
    revalidateTag("user-avatar-cache");

    return { success: true };
  } catch (error) {
    console.error("프로필 이미지 업데이트 중 오류:", error);
    return { error: "알 수 없는 오류가 발생했습니다." };
  }
}

// 프로필 정보 업데이트 (이미지 제외)
export async function updateUserProfile(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "인증된 사용자를 찾을 수 없습니다." };
    }

    const name = formData.get("name") as string;
    const selectedArtists = formData.getAll("selectedArtists") as string[];

    if (!name || name.trim() === "") {
      return { error: "이름을 입력해주세요." };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        name,
        favorites: selectedArtists,
      })
      .eq("id", user.id);

    if (updateError) {
      return {
        error: `프로필 업데이트 중 오류가 발생했습니다: ${updateError.message}`,
      };
    }

    // 프로필 관련 모든 경로 revalidate
    revalidatePath("/", "layout");
    revalidatePath("/my");
    revalidatePath("/my/profile-settings");
    revalidatePath("/feed", "layout");
    revalidatePath("/browse", "layout");

    // 프로필 관련 태그 revalidate
    revalidateTag("user-profile");
    revalidateTag("user-avatar");
    revalidateTag("user-avatar-cache");

    return { success: true };
  } catch (error) {
    console.error("프로필 업데이트 중 오류:", error);
    return { error: "알 수 없는 오류가 발생했습니다." };
  }
}
