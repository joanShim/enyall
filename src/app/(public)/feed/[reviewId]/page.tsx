import { getReview } from "@/app/actions/getReview";
import { notFound } from "next/navigation";
import ReviewDetail from "./ReviewDetail";
import ReviewHeader from "./ReviewHeader";

interface PageProps {
  params: Promise<{
    reviewId: string;
  }>;
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { reviewId } = await params;
  const { review, error } = await getReview(reviewId);

  if (error || !review) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ReviewHeader name={review.user?.name} />
      <ReviewDetail review={review} />

    </div>
  );
}
