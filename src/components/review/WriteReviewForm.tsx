"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConcertInfo } from "@/components/review/ConcertInfo";
import { useReviewFormStore } from "@/store/reviewFormStore";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { reviewFormSchema } from "@/schemas/reviewForm";
import { useGetConcert } from "@/hooks/useGetConcert";
import { Review } from "@/types/review";

// 리뷰 작성 단계에서 필요한 스키마만 추출
const writeReviewSchema = reviewFormSchema.pick({
  reviewContent: true,
});

type WriteReviewFormValues = z.infer<typeof writeReviewSchema>;

interface WriteReviewFormProps {
  isEditMode?: boolean;
  initialReview?: Review;
  onCancel?: () => void;
  onSuccess?: (review: Review) => void;
}

export default function WriteReviewForm({
  isEditMode = false,
  initialReview,
  onCancel,
  onSuccess,
}: WriteReviewFormProps) {
  const router = useRouter();
  const { concertId, reviewContent, setData } = useReviewFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 수정 모드일 때는 초기 리뷰의 콘서트 ID를 사용
  const effectiveConcertId = isEditMode
    ? initialReview?.concert?.id || null
    : concertId || null;

  const { concert, isLoading, error } = useGetConcert(effectiveConcertId);
  const supabase = createBrowserSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WriteReviewFormValues>({
    resolver: zodResolver(writeReviewSchema),
    defaultValues: {
      reviewContent: isEditMode ? initialReview?.content : reviewContent || "",
    },
  });

  // 수정 모드가 아닐 때만 로컬 스토리지 초기화 수행
  useEffect(() => {
    if (isEditMode) {
      setIsInitialized(true);
      return;
    }

    // 로컬 스토리지 초기화 로직 (기존과 동일)
    if (concertId) {
      setIsInitialized(true);
      return;
    }

    const storedState = localStorage.getItem("review-form-store");
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);
        if (parsedState.state?.concertId) {
          setData({ concertId: parsedState.state.concertId });
          setIsInitialized(true);
          return;
        }
      } catch (e) {
        console.error("로컬 스토리지 파싱 오류:", e);
      }
    }

    setIsInitialized(true);
  }, [concertId, setData, isEditMode]);

  // 수정 모드가 아닐 때만 리다이렉트 수행
  useEffect(() => {
    if (isEditMode) return;

    if (isInitialized && !concertId) {
      router.push("/new/select-concert");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, concertId, isEditMode]);

  const onSubmit = async (data: WriteReviewFormValues) => {
    if (isEditMode && initialReview) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  // 리뷰 생성 처리
  const handleCreate = async (data: WriteReviewFormValues) => {
    if (!concertId) return;

    setIsSubmitting(true);
    try {
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
          concert_id: concertId,
          content: data.reviewContent,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("리뷰가 성공적으로 등록되었습니다");
      router.push(`/feed/${newReview.id}`);

      setTimeout(() => {
        useReviewFormStore.getState().reset();
      }, 500);
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

  // 리뷰 수정 처리
  const handleUpdate = async (data: WriteReviewFormValues) => {
    if (!initialReview?.id) return;

    setIsSubmitting(true);
    try {
      // 리뷰 내용 업데이트
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          content: data.reviewContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialReview.id);

      if (updateError) throw updateError;

      // 업데이트된 리뷰 객체 생성 (기존 리뷰 객체에서 내용만 변경)
      const updatedReview: Review = {
        ...initialReview,
        content: data.reviewContent,
      };

      toast.success("리뷰가 성공적으로 수정되었습니다");

      if (onSuccess) {
        onSuccess(updatedReview);
      }
    } catch (error) {
      console.error("리뷰 수정 실패:", error);
      if (error instanceof Error) {
        toast.error(error.message || "리뷰 수정에 실패했습니다");
      } else {
        toast.error("리뷰 수정에 실패했습니다");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h3 className="text-lg font-medium">
              {isEditMode ? "리뷰 수정" : "관람후기"}
            </h3>
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

          <div className="flex justify-end gap-2 pt-4">
            {isEditMode && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "수정 중..."
                  : "등록 중..."
                : isEditMode
                  ? "수정 완료"
                  : "등록하기"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
