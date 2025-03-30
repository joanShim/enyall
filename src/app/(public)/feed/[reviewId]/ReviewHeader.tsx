import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, EllipsisVertical, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Review } from "@/types/review";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface ReviewHeaderProps {
  name: string | undefined;
  review: Review;
  isCurrentUserAuthor: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

export default function ReviewHeader({
  name,
  review,
  isCurrentUserAuthor,
  setIsEditing,
}: ReviewHeaderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const handleEdit = () => {
    setIsEditing(true);
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    setShowDeleteAlert(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id);

      if (error) throw error;

      toast.success("리뷰가 삭제되었습니다");
      router.back();
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      toast.error("리뷰 삭제에 실패했습니다");
    }
  };

  return (
    <>
      <DeleteConfirmDialog
        isOpen={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
        title="리뷰 삭제"
        description="정말 이 리뷰를 삭제하시겠습니까? 삭제된 리뷰는 복구되지 않습니다."
      />

      <header className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="w-full text-center text-sm font-bold">
          {name}님의 리뷰
        </h1>
        {isCurrentUserAuthor ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0" align="end">
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  className="flex items-center justify-start gap-2 px-4 py-2 text-sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                  <span>수정</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center justify-start gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-600"
                  onClick={handleDeleteClick}
                >
                  <Trash className="h-4 w-4" />
                  <span>삭제</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="w-10" />
        )}
      </header>
    </>
  );
}
