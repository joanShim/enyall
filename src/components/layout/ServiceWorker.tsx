"use client";
import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    // 프로덕션 환경에서만 서비스 워커 등록
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => console.log("✅ Service Worker 등록 완료!"))
          .catch((error) =>
            console.error("❌ Service Worker 등록 실패:", error),
          );
      });
    } else {
      console.log("개발 환경에서는 서비스 워커가 비활성화됩니다.");
    }
  }, []);

  return null;
}
