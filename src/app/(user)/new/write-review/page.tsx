import WriteReviewForm from "@/components/review/WriteReviewForm";

export default function WriteReviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* <h2 className="text-lg font-medium">리뷰 작성</h2> */}
      </div>

      <WriteReviewForm />
    </div>
  );
}
