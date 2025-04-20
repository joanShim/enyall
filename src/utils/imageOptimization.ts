import sharp from "sharp";

export async function optimizeProfileImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(256, 256, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 80 })
    .toBuffer();
}

export async function optimizePosterImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(800, 1067, {
      // 3:4 비율 유지
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 80 })
    .toBuffer();
}
