"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Review } from "@/types/review";

export async function getReview(reviewId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // 리뷰 정보 가져오기 (images 필드 추가)
    const { data: reviewData, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        content,
        rating,
        images,
        created_at,
        user_id,
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

    if (!reviewData) {
      throw new Error("리뷰를 찾을 수 없습니다");
    }

    // images 필드가 JSON 문자열로 저장되어 있을 경우를 대비한 처리
    let images = [];
    if (reviewData.images) {
      // 이미 배열이면 그대로 사용, 문자열이면 파싱
      images = Array.isArray(reviewData.images)
        ? reviewData.images
        : typeof reviewData.images === "string"
          ? JSON.parse(reviewData.images)
          : [];
    }

    // Review 타입으로 변환
    const review: Review = {
      id: reviewData.id,
      content: reviewData.content,
      rating: reviewData.rating,
      images: images,
      created_at: reviewData.created_at,
      user_id: reviewData.user_id,
      concert: reviewData.concert,
    };

    // 사용자 정보를 별도로 가져옵니다
    if (review.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", review.user_id)
        .single();

      if (userData) {
        review.user = userData;
      }
    }

    return { review };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "리뷰를 불러오는데 실패했습니다" };
  }
}
