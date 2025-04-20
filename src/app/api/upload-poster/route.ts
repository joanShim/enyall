import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    // 이미지 최적화
    const arrayBuffer = await file.arrayBuffer();
    const optimizedBuffer = await sharp(Buffer.from(arrayBuffer))
      .resize(800, 1067, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();

    // 파일 이름 생성
    const fileName = `${uuidv4()}.webp`;
    const filePath = `${fileName}`;

    // Supabase Storage에 업로드
    const { error } = await supabase.storage
      .from("posters")
      .upload(filePath, optimizedBuffer, {
        contentType: "image/webp",
      });

    if (error) {
      console.error(`포스터 업로드 실패: ${error.message}`);
      return NextResponse.json(
        { error: "이미지 업로드에 실패했습니다" },
        { status: 500 },
      );
    }

    // 업로드된 이미지 URL 가져오기
    const { data: urlData } = supabase.storage
      .from("posters")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("포스터 업로드 중 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
