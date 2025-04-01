"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, PenSquare } from "lucide-react";
import MyReviewListItem from "./MyReviewListItem";
import { useMyReviews } from "@/hooks/useMyReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Review } from "@/types/review";

export default function MyReviewList() {
  const { reviews, isLoading, error, isEmpty } = useMyReviews();

  if (isLoading) {
    return (
      <section>
        <h2 className="p-2 text-xl font-bold">기록</h2>
        <div className="grid grid-cols-2 gap-2 border-t p-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 p-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="p-2 text-xl font-bold">기록</h2>

      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
          <p className="mb-4">리뷰를 불러오는 중 오류가 발생했습니다</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
          <p className="mb-4 text-sm">콘서트의 추억들을 기록해보세요 🎫</p>
          <Link href="/new" passHref>
            <Button variant="outline" size="sm">
              <PenSquare className="mr-2 h-4 w-4" />
              기록하기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 border-t">
          {Array.isArray(reviews) &&
            reviews.map((review: Review) => (
              <MyReviewListItem key={review.id} review={review} />
            ))}
        </div>
      )}
    </section>
  );
}
