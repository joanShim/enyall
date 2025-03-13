import SignOutButton from "@/components/auth/SignOutButton";
import Header from "@/components/layout/Header";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import Image from "next/image";

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { user_name, avatar_url } = session?.user.user_metadata ?? {};
  return (
    <>
      <Header title={user_name} />
      <SignOutButton />
      <section className="flex flex-col items-center justify-center border-y px-3 py-4">
        <div className="relative size-20 overflow-hidden rounded-full border">
          <Image
            src={avatar_url}
            alt="프로필 이미지"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <p className="text-md font-bold underline py-2">{user_name}</p>
      </section>
    </>
  );
}
