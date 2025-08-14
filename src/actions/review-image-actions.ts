import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { optimizeReviewImage } from "@/utils/imageOptimization";

// 리뷰 이미지 업로드
export async function uploadReviewImage(file: File) {
  try {
    const supabase = await createClient();

    // 파일 크기 검사 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "파일 크기는 5MB 이하여야 합니다." };
    }

    // 이미지 파일 타입 검사
    if (!file.type.startsWith("image/")) {
      return { error: "이미지 파일만 업로드 가능합니다." };
    }

    // 이미지 최적화
    const arrayBuffer = await file.arrayBuffer();
    const optimizedBuffer = await optimizeReviewImage(Buffer.from(arrayBuffer));

    // 파일 이름 생성
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
    const filePath = `${fileName}`;

    // Supabase Storage에 업로드
    const { error } = await supabase.storage
      .from("reviews")
      .upload(filePath, optimizedBuffer, {
        contentType: "image/webp",
      });

    if (error) {
      console.error(`리뷰 이미지 업로드 실패: ${error.message}`);
      return { error: "리뷰 이미지 업로드에 실패했습니다." };
    }

    // 업로드된 이미지 URL 가져오기
    const { data: urlData } = supabase.storage
      .from("reviews")
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("리뷰 이미지 업로드 중 오류:", error);
    return { error: "서버 오류가 발생했습니다." };
  }
}

// 리뷰 이미지 삭제
export async function deleteReviewImage(imageUrl: string) {
  try {
    const supabase = await createClient();

    // URL에서 파일 경로 추출
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      return { error: "잘못된 이미지 URL입니다." };
    }

    const { error } = await supabase.storage.from("reviews").remove([fileName]);

    if (error) {
      console.error(`리뷰 이미지 삭제 실패: ${error.message}`);
      return { error: "리뷰 이미지 삭제에 실패했습니다." };
    }

    return { success: true };
  } catch (error) {
    console.error("리뷰 이미지 삭제 중 오류:", error);
    return { error: "서버 오류가 발생했습니다." };
  }
}
