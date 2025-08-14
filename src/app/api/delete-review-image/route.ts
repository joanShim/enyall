import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 URL이 제공되지 않았습니다." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // URL에서 파일 경로 추출
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      return NextResponse.json(
        { error: "잘못된 이미지 URL입니다." },
        { status: 400 },
      );
    }

    const { error } = await supabase.storage.from("reviews").remove([fileName]);

    if (error) {
      console.error(`리뷰 이미지 삭제 실패: ${error.message}`);
      return NextResponse.json(
        { error: "리뷰 이미지 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("리뷰 이미지 삭제 중 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
