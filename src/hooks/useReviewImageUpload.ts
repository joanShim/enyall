import { useState } from "react";
export interface ImageFile {
  file?: File; // 새 이미지일 경우만 File 객체 존재
  previewUrl: string;
  id: string;
  isExisting?: boolean; // 기존 이미지인지 여부
  url?: string; // 기존 이미지의 실제 URL (스토리지 경로 추출용)
}

export function useReviewImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  // 리뷰 이미지들을 API를 통해 업로드
  const uploadReviewImages = async (
    imageFiles: ImageFile[],
    deletedImageUrls: string[],
    isEditMode: boolean,
    initialReviewImages?: string[],
  ): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    // 1. 기존 이미지 중 삭제되지 않은 이미지 URL 먼저 추가
    if (isEditMode && initialReviewImages?.length) {
      const remainingImages = initialReviewImages.filter(
        (url) => !deletedImageUrls.includes(url),
      );
      uploadedUrls.push(...remainingImages);
    }

    // 2. 새 이미지 파일만 API를 통해 업로드
    for (const imageFile of imageFiles) {
      if (imageFile.isExisting) continue;

      try {
        if (!imageFile.file) continue;

        // FormData 생성
        const formData = new FormData();
        formData.append("file", imageFile.file);

        // API 라우트를 통해 업로드 (이미지 최적화 포함)
        const response = await fetch("/api/upload-review-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`리뷰 이미지 업로드 실패: ${errorData.error}`);
          continue;
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      } catch (error) {
        console.error("리뷰 이미지 업로드 중 오류:", error);
      }
    }

    return uploadedUrls;
  };

  // 삭제된 리뷰 이미지들을 API를 통해 제거
  const deleteRemovedReviewImages = async (
    deletedImageUrls: string[],
  ): Promise<void> => {
    if (!deletedImageUrls.length) return;

    for (const imageUrl of deletedImageUrls) {
      try {
        const response = await fetch("/api/delete-review-image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`리뷰 이미지 삭제 실패: ${errorData.error}`);
        }
      } catch (error) {
        console.error("리뷰 이미지 삭제 중 오류:", error);
      }
    }
  };

  // 이미지 미리보기 URL 정리
  const cleanupImagePreviews = (imageFiles: ImageFile[]): void => {
    imageFiles
      .filter((img) => !img.isExisting)
      .forEach((img) => URL.revokeObjectURL(img.previewUrl));
  };

  return {
    isUploading,
    setIsUploading,
    uploadReviewImages,
    deleteRemovedReviewImages,
    cleanupImagePreviews,
  };
}
