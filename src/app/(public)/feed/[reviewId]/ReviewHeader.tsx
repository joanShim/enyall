"use client";

import { Button } from "@/components/ui/button";

import { ChevronLeft, EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewHeader({ name }: { name: string | undefined }) {
  const router = useRouter();

  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="w-full text-center text-sm font-bold">{name}</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <EllipsisVertical className="h-5 w-5" />
        </Button>
      </header>
    </>
  );
}
