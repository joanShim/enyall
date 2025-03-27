"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function getReview(reviewId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: review, error } = await supabase
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
      .eq("id", reviewId)
      .single();

    if (error) throw error;

    if (!review) {
      throw new Error("리뷰를 찾을 수 없습니다");
    }

    return { review };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "리뷰를 불러오는데 실패했습니다" };
  }
}
