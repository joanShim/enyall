import SignInWithKakao from "@/components/auth/SignInWithKakao";
import SignInWithGoogle from "@/components/auth/SignInWithGoogle";
import Image from "next/image";

export default function SignInPage() {
  return (
    <section className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
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
        <SignInWithKakao />
        <SignInWithGoogle />
      </div>
    </section>
  );
}
