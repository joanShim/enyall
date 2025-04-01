import { Json } from "./db";

export type Venue = {
  id: string;
  name: string;
  address: string | null;
};

export type Schedule = {
  schedule_date: string;
  start_time: string;
};

// Supabase에서 실제로 반환되는 콘서트 구조
export type ReviewConcert = {
  id: string;
  title: string;
  poster_url: string | null;
  artists_json: Json; // Json 타입 허용
  venue: Venue;
  concert_schedules: Schedule[];
};

export type Review = {
  id: string;
  content: string;
  images?: string[];
  rating: number | null;
  created_at: string | null;
  user_id?: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string;
  };
  concert: ReviewConcert | null; // 수정된 타입 사용
  concert_id?: string;
};

export interface MyReviewListItemProps {
  review: Review;
}
