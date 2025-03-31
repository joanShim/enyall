import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageFile {
  file: File;
  previewUrl: string;
  id: string;
}

interface ImageUploaderProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setIsLoading(true);
      const newImages = [...images];
      const maxUploadSize = 5 * 1024 * 1024; // 5MB

      try {
        // 각 파일 처리
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // 파일 크기 검사
          if (file.size > maxUploadSize) {
            toast.error(
              `${file.name}의 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`,
            );
            continue;
          }

          // 이미지 타입 검사
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name}은 이미지 파일이 아닙니다.`);
            continue;
          }

          // 미리보기 URL 생성
          const previewUrl = URL.createObjectURL(file);
          const id = `${Date.now()}-${newImages.length}`;

          newImages.push({
            file,
            previewUrl,
            id,
          });
        }

        onChange(newImages);
      } catch (error) {
        console.error("이미지 처리 중 오류:", error);
        toast.error("이미지 처리에 실패했습니다.");
      } finally {
        setIsLoading(false);
        // 입력 필드 초기화
        event.target.value = "";
      }
    },
    [images, onChange],
  );

  const removeImage = (index: number) => {
    const newImages = [...images];

    // 미리보기 URL 해제 (메모리 누수 방지)
    URL.revokeObjectURL(newImages[index].previewUrl);

    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={disabled || isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "처리 중..." : "사진 추가하기"}
        </Button>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
          disabled={disabled || isLoading}
        />
        <p className="text-xs text-muted-foreground">
          최대 5MB, JPG, PNG, GIF 파일 지원
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-md"
            >
              <Image
                src={image.previewUrl}
                alt={`리뷰 이미지 ${index + 1}`}
                fill
                sizes="(max-width: 768px) 33vw, 25vw"
                className="object-cover"
              />
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
