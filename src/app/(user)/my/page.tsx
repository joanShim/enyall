import Header from "@/components/layout/Header";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import CreateReviewButton from "./CreateReviewButton";
import { getUserProfileWithFavorites } from "@/actions/user-actions";
import Favorites from "./Favorites";
import MyReviewList from "./MyReviewList";

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <div>로그인이 필요합니다.</div>;
  }

  // 사용자 정보와 좋아하는 아티스트 정보를 한 번에 가져오기
  const { user, favoriteArtists, error } = await getUserProfileWithFavorites(
    session.user.id,
  );

  if (error || !user) {
    return <div>{error || "사용자 정보를 찾을 수 없습니다."}</div>;
  }

  return (
    <>
      <Header title={user.name} />
      <CreateReviewButton />
      <section className="rel flex flex-col items-center justify-center border-y px-3 py-4">
        <div className="relative size-20 overflow-hidden rounded-full border">
          <Image
            src={user.avatar_url}
            priority
            alt="프로필 이미지"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <Link
          href="/my/profile-settings"
          className="text-md py-2 font-bold underline"
        >
          {user.name}
        </Link>

        {/* 좋아하는 아티스트 섹션 */}
        {favoriteArtists && favoriteArtists.length > 0 && (
          <Favorites artists={favoriteArtists} />
        )}
      </section>
      <MyReviewList />
    </>
  );
}
