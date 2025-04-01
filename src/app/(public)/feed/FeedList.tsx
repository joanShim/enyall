"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeed } from "@/hooks/useFeed";
import { AlertCircle, RefreshCw } from "lucide-react";
import FeedItem from "./FeedItem";

export default function FeedList() {
  const { reviews, isLoading, error, isEmpty, refetch } = useFeed();

  if (isLoading) {
    return (
      <div className="space-y-4 divide-y border-y">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="mb-2 h-4 w-40" />
            <Skeleton className="mb-4 h-3 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-red-50 p-6 text-center text-red-500">
        <AlertCircle className="h-12 w-12" />
        <p>{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>
    );
  }

  if (isEmpty) {
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
