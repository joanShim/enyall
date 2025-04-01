import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, PenSquare } from "lucide-react";
import MyReviewListItem from "./MyReviewListItem";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export default async function MyReviewList() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      content,
      rating,
      created_at,
      concert:concert_id (
        id,
        title,
        poster_url,
        artists_json,
        venue:venue_id (
          id,
          name,
          address
        ),
        concert_schedules (
          schedule_date,
          start_time
        )
      )
    `,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="p-4">
      <h2 className="text-xl font-bold">기록</h2>

      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
          <p className="mb-4">리뷰를 불러오는 중 오류가 발생했습니다</p>
          <Link href="/my" passHref>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
          </Link>
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
          <p className="mb-4 text-sm">콘서트의 추억들을 기록해보세요 🎫</p>
          <Link href="/new" passHref>
            <Button variant="outline" size="sm">
              <PenSquare className="mr-2 h-4 w-4" />
              기록하기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-2 border-t">
          {reviews.map((review) => (
            <MyReviewListItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
