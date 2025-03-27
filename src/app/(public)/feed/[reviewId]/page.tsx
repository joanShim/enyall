import { getReview } from "@/app/actions/getReview";
import { notFound } from "next/navigation";

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
      <h1 className="mb-4 text-2xl font-bold">{review.concert?.title}</h1>
      {/* 나머지 리뷰 상세 내용 렌더링 */}
    </div>
  );
}
