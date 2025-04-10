"use client";

import NewConcertForm from "@/components/review/NewConcertForm";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NewConcertPage() {
  const router = useRouter();
  return (
    <section>
      <div className="mb-4 flex items-center justify-between py-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          새 콘서트 등록
        </h1>
        <div className="size-9" />
      </div>

      <NewConcertForm />
    </section>
  );
}
