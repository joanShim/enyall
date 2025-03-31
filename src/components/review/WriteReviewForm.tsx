"use client";

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
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
import { Review } from "@/types/review";
import { ImageFile, ImageUploader } from "@/components/review/ImageUploader";
import { v4 as uuidv4 } from "uuid";

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

const WriteReviewForm = forwardRef<HTMLFormElement, WriteReviewFormProps>(
  function WriteReviewForm(
    { isEditMode = false, initialReview, onSuccess },
    ref,
  ) {
    const router = useRouter();
    const { concertId, reviewContent, setData } = useReviewFormStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

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
        reviewContent: isEditMode
          ? initialReview?.content
          : reviewContent || "",
      },
    });

    const formRef = useRef<HTMLFormElement>(null);

    // ref를 통해 외부에서 폼에 접근할 수 있도록 함
    useImperativeHandle(ref, () => formRef.current!);

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

    // 수정 모드에서 초기 이미지 설정
    useEffect(() => {
      if (isEditMode && initialReview?.images?.length && isInitialized) {
        // 이미지 초기화 로직은 ImageUploader 컴포넌트에서 처리
      }
    }, [isEditMode, initialReview, isInitialized]);

    // 이미지 파일 업로드 함수
    const uploadImagesToStorage = async (): Promise<string[]> => {
      const uploadedUrls: string[] = [];

      // 1. 기존 이미지 중 삭제되지 않은 이미지 URL 먼저 추가
      if (isEditMode && initialReview?.images?.length) {
        // 삭제되지 않은 기존 이미지만 포함
        const remainingImages = initialReview.images.filter(
          (url) => !deletedImageUrls.includes(url),
        );
        uploadedUrls.push(...remainingImages);
      }

      // 2. 새 이미지 파일만 업로드 (isExisting이 false인 것들)
      for (const imageFile of imageFiles) {
        // 기존 이미지는 건너뛰기 (이미 URL이 있음)
        if (imageFile.isExisting) continue;

        try {
          // 새 이미지만 업로드
          if (!imageFile.file) continue;

          // 파일 이름 생성
          const fileExt = imageFile.file.name.split(".").pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${fileName}`;

          // Supabase Storage에 업로드
          const { error } = await supabase.storage
            .from("reviews")
            .upload(filePath, imageFile.file);

          if (error) {
            console.error(`이미지 업로드 실패: ${error.message}`);
            continue;
          }

          // 업로드된 이미지 URL 가져오기
          const { data: urlData } = supabase.storage
            .from("reviews")
            .getPublicUrl(filePath);

          uploadedUrls.push(urlData.publicUrl);
        } catch (error) {
          console.error("이미지 업로드 중 오류:", error);
        }
      }

      return uploadedUrls;
    };

    // 삭제된 이미지 처리 함수
    const deleteRemovedImages = async (): Promise<void> => {
      if (!deletedImageUrls.length) return;

      for (const imageUrl of deletedImageUrls) {
        try {
          // URL에서 파일 경로 추출
          // 예: https://supabase-storage.com/storage/v1/object/public/reviews/image.jpg
          // -> image.jpg
          const urlParts = imageUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];

          if (!fileName) continue;

          const { error } = await supabase.storage
            .from("reviews")
            .remove([fileName]);

          if (error) {
            console.error(`이미지 삭제 실패: ${error.message}`);
          }
        } catch (error) {
          console.error("이미지 삭제 중 오류:", error);
        }
      }
    };

    const onSubmit = async (data: WriteReviewFormValues) => {
      if (isEditMode && initialReview) {
        await handleUpdate(data);
      } else {
        await handleCreate(data);
      }
    };

    const handleImageChange = (images: ImageFile[]) => {
      setImageFiles(images);
    };

    const handleDeletedImages = (urls: string[]) => {
      setDeletedImageUrls(urls);
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

        // 이미지 업로드 수행
        const uploadedImageUrls = await uploadImagesToStorage();

        const { data: newReview, error } = await supabase
          .from("reviews")
          .insert({
            user_id: user.id,
            concert_id: concertId,
            content: data.reviewContent,
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) throw error;

        toast.success("리뷰가 성공적으로 등록되었습니다");
        router.push(`/feed/${newReview.id}`);

        // 이미지 미리보기 URL 정리 (메모리 누수 방지)
        imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));

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
        // 1. 삭제된 이미지 처리
        await deleteRemovedImages();

        // 2. 이미지 업로드 수행 (기존 이미지 + 새 이미지)
        const uploadedImageUrls = await uploadImagesToStorage();

        // 3. 리뷰 업데이트
        const { error: updateError } = await supabase
          .from("reviews")
          .update({
            content: data.reviewContent,
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialReview.id);

        if (updateError) throw updateError;

        // 업데이트된 리뷰 정보 생성
        const updatedReview: Review = {
          ...initialReview,
          content: data.reviewContent,
          images: uploadedImageUrls,
        };

        // 이미지 미리보기 URL 정리
        imageFiles
          .filter((img) => !img.isExisting)
          .forEach((img) => URL.revokeObjectURL(img.previewUrl));

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

        <form id="review-form" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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

            <ImageUploader
              images={imageFiles}
              initialUrls={isEditMode ? initialReview?.images : []}
              onChange={handleImageChange}
              onDeletedImages={handleDeletedImages}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    );
  },
);

export default WriteReviewForm;
