import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CompleteProfileForm from "./CompleteProfileForm";
import { getArtists } from "@/actions/complete-profile-actions";

export default async function CompleteProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // 이미 users 테이블에 사용자 정보가 있는지 확인
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // 이미 프로필이 완성되어 있으면 마이페이지로 리다이렉트
  if (existingUser) {
    console.log("이미 프로필이 완성되어 있습니다.");
    redirect("/my");
  }

  // 아티스트 목록 가져오기
  const { artists, error } = await getArtists();

  if (error) {
    console.error("아티스트 목록을 불러오는데 실패했습니다:", error);
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="mb-6 text-2xl font-bold">프로필 완성하기</h1>
      <CompleteProfileForm user={user} artists={artists || []} />
    </div>
  );
}
