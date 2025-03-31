import { Review } from "@/types/review";
import FeedItem from "./FeedItem";
import { AlertCircle } from "lucide-react";

interface FeedListProps {
  reviews: Review[];
  error?: string;
}

export default function FeedList({ reviews, error }: FeedListProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-red-50 p-6 text-center text-red-500">
        <AlertCircle className="h-12 w-12" />
        <p>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <p>아직 리뷰가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 divide-y border-y">
      {reviews.map((review) => (
        <FeedItem key={review.id} review={review} />
      ))}
    </div>
  );
}
