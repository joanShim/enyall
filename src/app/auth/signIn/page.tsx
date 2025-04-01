import SignInWithKakao from "@/components/auth/SignInWithKakao";
import SignInWithGoogle from "@/components/auth/SignInWithGoogle";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function SignInPage() {
  return (
    <section className="flex h-[calc(100vh-64px)] w-full flex-col items-center justify-center px-8">
      {/* <FallingGrapes /> */}
      <div className="z-10 flex flex-col items-center justify-center gap-2 bg-white p-6">
        <div className="size-20 overflow-hidden rounded-full border">
          <Image
            src="/enyall-logo.svg"
            alt="Enyall Logo"
            width={200}
            height={200}
            content="fit"
            priority
          />
        </div>
        <div className="text-2xl font-extrabold">내가 사랑한 모든 무대를</div>
        <div className="text-2xl font-extrabold">계속 떠올릴 수 있도록</div>
        <Heart fill="currentColor" size={16} className="animate-spin-y mb-12" />

        <SignInWithKakao />
        <SignInWithGoogle />
      </div>
    </section>
  );
}
