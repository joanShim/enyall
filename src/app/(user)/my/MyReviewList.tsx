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

  // if (!reviews || reviews.length === 0) {
  //   return (
  //     <section className="p-4">
  //       <h2 className="mb-4 text-xl font-bold">기록</h2>
  //       <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
  //         아직 작성한 리뷰가 없습니다
  //       </div>
  //     </section>
  //   );
  // }

  return (
    <section className="">
      <h2 className="ml-2 text-xl font-bold underline">기록</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* <MyReviewListItem key={review.id} review={review} /> */}
      </div>
    </section>
  );
}
