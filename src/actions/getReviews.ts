"use server";

import { createClient } from "@/utils/supabase/server";
import { Review, ReviewConcert } from "@/types/review";

export async function getReviews() {
  try {
    const supabase = await createClient();

    // 리뷰 정보 가져오기 (최신순으로 정렬)
    const { data: reviewsData, error } = await supabase
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
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 리뷰 데이터에 사용자 정보 추가
    const reviews: Review[] = [];

    for (const reviewData of reviewsData) {
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

      const review: Review = {
        id: reviewData.id,
        content: reviewData.content,
        rating: reviewData.rating,
        images: images,
        created_at: reviewData.created_at,
        user_id: reviewData.user_id,
        // todo: 타입 수정
        concert: reviewData.concert as unknown as ReviewConcert,
      };

      // 사용자 정보 가져오기
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

      reviews.push(review);
    }

    return { reviews };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "리뷰 목록을 불러오는데 실패했습니다" };
  }
}
