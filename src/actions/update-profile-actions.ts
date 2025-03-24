"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function updateUserProfile(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // 현재 인증된 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "인증된 사용자를 찾을 수 없습니다." };
    }

    const name = formData.get("name") as string;
    // 선택된 아티스트 ID 배열 가져오기
    const selectedArtists = formData.getAll("selectedArtists") as string[];

    if (!name || name.trim() === "") {
      return { error: "이름을 입력해주세요." };
    }

    // users 테이블에 사용자 정보 업데이트
    const { error: updateError } = await supabase
      .from("users")
      .update({
        name,
        favorites: selectedArtists,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("사용자 정보 업데이트 오류:", updateError);
      return {
        error: `프로필 업데이트 중 오류가 발생했습니다: ${updateError.message}`,
      };
    }

    // 사용자 메타데이터 업데이트
    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: { name },
    });

    if (authUpdateError) {
      console.error("인증 정보 업데이트 오류:", authUpdateError);
    }

    // 캐시 갱신
    revalidatePath("/my");
    revalidatePath("/my/profile-settings");

    // 성공 반환
    return { success: true };
  } catch (error) {
    console.error("프로필 업데이트 오류:", error);
    return { error: "알 수 없는 오류가 발생했습니다." };
  }
}
