import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { optimizeProfileImage } from "@/utils/imageOptimization";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "파일 이름이 제공되지 않았습니다." },
        { status: 400 },
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { error: "파일이 제공되지 않았습니다." },
        { status: 400 },
      );
    }

    try {
      // 이미지 최적화
      const buffer = await request.arrayBuffer();
      const optimizedBuffer = await optimizeProfileImage(Buffer.from(buffer));

      // 최적화된 이미지 업로드
      const blob = await put(filename, optimizedBuffer, {
        access: "public",
      });

      revalidatePath("/my");
      revalidatePath("/my/profile-settings");

      return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
      console.error("이미지 처리 중 오류:", error);
      return NextResponse.json(
        { error: "이미지 처리 중 오류가 발생했습니다." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      { error: "서버에서 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
