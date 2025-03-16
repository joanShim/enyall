import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateReviewButton() {
  return (
    <Link
      href="/new"
      aria-label="새 리뷰 작성"
      className="absolute bottom-20 right-4 z-50 flex size-12 items-center justify-center bg-primary text-white"
    >
      <Plus />
    </Link>
  );
}
