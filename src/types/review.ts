import { Json } from "./db";

type Venue = {
  id: string;
  name: string;
  address: string | null;
};

type Schedule = {
  schedule_date: string;
  start_time: string;
};

type Concert = {
  id: string;
  title: string;
  poster_url: string | null;
  artists_json: Json | null;
  venue: Venue | null;
  concert_schedules?: Schedule[];
};

export type Review = {
  id: string;
  content: string;
  rating: number | null;
  created_at: string | null;
  concert: Concert | null;
};

export interface MyReviewListItemProps {
  review: Review;
}
