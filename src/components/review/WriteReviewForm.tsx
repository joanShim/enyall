"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ConcertInfo } from "@/components/review/ConcertInfo";
import { useReviewFormStore } from "@/store/reviewFormStore";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { reviewFormSchema } from "@/schemas/reviewForm";
import { useGetConcert } from "@/hooks/useGetConcert";

// 리뷰 작성 단계에서 필요한 스키마만 추출
const writeReviewSchema = reviewFormSchema.pick({
  reviewContent: true,
});

type WriteReviewFormValues = z.infer<typeof writeReviewSchema>;

export default function WriteReviewForm() {
  const router = useRouter();
  const { concertId, reviewContent, isPendingConcert, setData } =
    useReviewFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { concert, isLoading, error } = useGetConcert(concertId || null);
  const supabase = createBrowserSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WriteReviewFormValues>({
    resolver: zodResolver(writeReviewSchema),
    defaultValues: {
      reviewContent: reviewContent || "",
    },
  });

  // 로컬 스토리지 초기화 useEffect
  useEffect(() => {
    // 이미 concertId가 있으면 초기화 완료 표시
    if (concertId) {
      setIsInitialized(true);
      return;
    }

    // 로컬 스토리지에서 데이터 확인
    const storedState = localStorage.getItem("review-form-store");
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);
        if (parsedState.state?.concertId) {
          // 스토어에 concertId 설정
          setData({ concertId: parsedState.state.concertId });
          setIsInitialized(true);
          return;
        }
      } catch (e) {
        console.error("로컬 스토리지 파싱 오류:", e);
      }
    }

    setIsInitialized(true);
  }, [concertId, setData]);

  // 리다이렉트 useEffect - 초기화 완료 후에만 실행
  useEffect(() => {
    if (isInitialized && !concertId) {
      router.push("/new/select-concert");
    }
  }, [isInitialized, concertId, router]);

  const onSubmit = async (data: WriteReviewFormValues) => {
    if (!concertId) return;

    setIsSubmitting(true);
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다");
      }

      const { data: newReview, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          [isPendingConcert ? "pending_concert_id" : "verified_concert_id"]:
            concertId,
          content: data.reviewContent,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("리뷰가 성공적으로 등록되었습니다");

      // 스토어 초기화
      useReviewFormStore.getState().reset();

      // 생성된 리뷰 페이지로 리다이렉트
      router.push(`/reviews/${newReview.id}`);
    } catch (error) {
      console.error("리뷰 등록 실패:", error);

      if (error instanceof Error) {
        toast.error(error.message || "리뷰 등록에 실패했습니다");
      } else {
        toast.error("리뷰 등록에 실패했습니다");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 초기화 중이거나 로딩 중일 때 로딩 표시
  if (!isInitialized || isLoading) {
    return <div>콘서트 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div>콘서트 정보를 불러오는데 실패했습니다: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <ConcertInfo concert={concert} />

      <form id="review-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">관람후기</h3>
          </div>

          <Textarea
            {...register("reviewContent")}
            placeholder="공연에 대한 후기를 작성해주세요"
            rows={8}
            disabled={isSubmitting}
            className="resize-none"
          />

          {errors.reviewContent && (
            <p className="text-sm text-red-500">
              {errors.reviewContent.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
