"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeUserProfile(formData: FormData) {
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

    if (!name || name.trim() === "") {
      return { error: "이름을 입력해주세요." };
    }

    // 카카오 로그인에서 가져온 프로필 이미지 URL
    const avatar_url = user.user_metadata.avatar_url || "";
    const email = user.email || "";

    // users 테이블에 사용자 정보 저장
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      name,
      email,
      avatar_url,
      favorites: [],
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("사용자 정보 저장 오류:", insertError);
      return { error: "프로필 저장 중 오류가 발생했습니다." };
    }

    // 사용자 메타데이터 업데이트 (선택사항)
    await supabase.auth.updateUser({
      data: { user_name: name },
    });

    // 캐시 갱신
    revalidatePath("/");

    // 성공 반환
    return { success: true };
  } catch (error) {
    console.error("프로필 완성 오류:", error);
    return { error: "알 수 없는 오류가 발생했습니다." };
  }
}
