import SignInWithKakao from "@/components/auth/SignInWithKakao";
import SignInWithGoogle from "@/components/auth/SignInWithGoogle";
import Image from "next/image";

export default function SignInPage() {
  return (
    <section className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/enyall-logo.svg"
          alt="Enyall Logo"
          width={68}
          height={31}
          priority
          className="mb-8"
        />
        <SignInWithKakao />
        <SignInWithGoogle />
      </div>
    </section>
  );
}
