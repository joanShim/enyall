"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReviewHeader({ isSubmitting }: { isSubmitting?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const isWriteReview = pathname === "/new/write-review";

  return (
    <div className="mb-4 flex items-center justify-between py-2">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="flex-1 text-center text-lg font-semibold">리뷰 작성</h1>
      {isWriteReview ? (
        <Button form="review-form" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "등록 중..." : "등록"}
        </Button>
      ) : (
        <div className="w-[67px]" />
      )}
    </div>
  );
}
