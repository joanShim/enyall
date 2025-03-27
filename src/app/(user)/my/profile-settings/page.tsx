import { getArtists } from "@/actions/update-profile-actions";
import SignOutButton from "@/components/auth/SignOutButton";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfileSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // 아티스트 목록 가져오기
  const { artists, error } = await getArtists();
  if (error) {
    console.error("아티스트 목록을 불러오는데 실패했습니다:", error);
  }

  // 사용자의 favorites 데이터 가져오기
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("favorites")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("사용자 데이터를 불러오는데 실패했습니다:", userError);
  }

  const userFavorites = userData?.favorites || [];

  return (
    <section className="flex w-full flex-col items-center gap-2 p-4">
      <ProfileForm
        user={user}
        artists={artists || []}
        userFavorites={userFavorites}
      />
      <SignOutButton />
    </section>
  );
}
