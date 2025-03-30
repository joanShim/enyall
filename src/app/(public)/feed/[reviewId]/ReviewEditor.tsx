"use client";

import { useState } from "react";
import { Review } from "@/types/review";
import ReviewDetail from "./ReviewDetail";
import ReviewHeader from "./ReviewHeader";
import WriteReviewForm from "@/components/review/WriteReviewForm";
import { useRouter } from "next/navigation";

interface ReviewEditorProps {
  review: Review;
  isCurrentUserAuthor: boolean;
}

export default function ReviewEditor({
  review,
  isCurrentUserAuthor,
}: ReviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review>(review);
  const router = useRouter();

  // 리뷰 업데이트 성공 핸들러
  const handleUpdateSuccess = (updatedReview: Review) => {
    setCurrentReview(updatedReview);
    setIsEditing(false);
    // 페이지 리프레시를 위한 라우터 리프레시
    router.refresh();
  };


  return (
    <>
      <ReviewHeader
        name={currentReview.user?.name}
        review={currentReview}
        isCurrentUserAuthor={isCurrentUserAuthor}
        setIsEditing={setIsEditing}
      />

      {isEditing ? (
        <WriteReviewForm
          isEditMode={true}
          initialReview={currentReview}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleUpdateSuccess}
        />
      ) : (
        <ReviewDetail review={currentReview} />
      )}
    </>
  );
}
