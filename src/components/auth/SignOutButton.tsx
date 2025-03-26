"use client";

import { redirect } from "next/navigation";
import { Button } from "../ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    redirect("/auth/signIn");
  };
  return (
    <>
      <Button variant="link" className="text-gray-500" onClick={handleSignOut}>
        로그아웃
      </Button>
    </>
  );
}
