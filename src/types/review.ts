import { Tables } from "./db";

export type Review = Tables<"reviews"> & {
  concert: {
    id: string;
    title: string;
    poster_url: string | null;
    artists_json: Array<{
      id?: string;
      name_official?: string;
      name_ko?: string;
      name_en?: string;
    }> | null;
    venue: {
      id: string;
      name: string;
    } | null;
    concert_schedules: Array<{
      schedule_date: string;
      start_time: string;
    }> | null;
  } | null;
};

export interface MyReviewListItemProps {
  review: Review;
}
