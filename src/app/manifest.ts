import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "엔열",
    short_name: "엔열",
    description:
      "즐거웠던 시간을 기록하고 공유하는 콘서트 리뷰 아카이브 | 공연장 시야 정보 | 콘서트 후기",
    start_url: "/",
    lang: 'ko',
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5237C9",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
