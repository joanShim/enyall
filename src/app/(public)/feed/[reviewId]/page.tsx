import { getReview } from "@/actions/getReview";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReviewEditor from "./ReviewEditor";

interface PageProps {
  params: Promise<{
    reviewId: string;
  }>;
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { reviewId } = await params;
  const { review, error } = await getReview(reviewId);
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (error || !review) {
    notFound();
  }

  const isCurrentUserAuthor = session?.user.id === review.user_id;

  return (
    <div className="container mx-auto px-4">
      <ReviewEditor review={review} isCurrentUserAuthor={isCurrentUserAuthor} />
    </div>
  );
}
