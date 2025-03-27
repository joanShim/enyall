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

  if (error) {
    console.error("리뷰를 불러오는 중 오류 발생:", error);
    return (
      <section className="p-4">
        <h2 className="ml-2 text-xl font-bold underline">기록</h2>
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
          리뷰를 불러오는 중 오류가 발생했습니다
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="p-4">
        <h2 className="ml-2 text-xl font-bold underline">기록</h2>
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
          아직 작성한 리뷰가 없습니다
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <h2 className="ml-2 text-xl font-bold underline">기록</h2>
      <div className="mt-4 grid grid-cols-2 border-t">
        {reviews.map((review) => (
          <MyReviewListItem key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
