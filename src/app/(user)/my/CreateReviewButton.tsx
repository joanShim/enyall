import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateReviewButton() {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 mx-auto max-w-md">
      <Link
        href="/new"
        aria-label="새 리뷰 작성"
        className="absolute bottom-0 right-4 z-50 flex size-12 items-center justify-center bg-primary text-white"
      >
        <Plus />
      </Link>
    </div>
  );
}
