import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export interface ImageFile {
  file?: File; // 새 이미지일 경우만 File 객체 존재
  previewUrl: string;
  id: string;
  isExisting?: boolean; // 기존 이미지인지 여부
  url?: string; // 기존 이미지의 실제 URL (스토리지 경로 추출용)
}

interface ImageUploaderProps {
  images: ImageFile[];
  initialUrls?: string[]; // 기존 이미지 URL 배열
  onChange: (images: ImageFile[]) => void;
  onDeletedImages?: (urls: string[]) => void; // 삭제된 기존 이미지 URL 반환
  disabled?: boolean;
}

export function ImageUploader({
  images,
  initialUrls = [],
  onChange,
  onDeletedImages,
  disabled = false,
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 이미지 설정 - 딱 한 번만 실행되도록 수정
  useEffect(() => {
    if (initialUrls.length > 0 && images.length === 0 && !isInitialized) {
      const existingImages: ImageFile[] = initialUrls.map((url) => ({
        previewUrl: url,
        id: uuidv4(),
        isExisting: true,
        url,
      }));
      onChange(existingImages);
      setIsInitialized(true);
    }
  }, [initialUrls, images.length, onChange, isInitialized]);

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
            isExisting: false,
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
    const removedImage = newImages[index];

    // 기존 이미지인 경우 삭제 목록에 추가
    if (removedImage.isExisting && removedImage.url) {
      const newDeletedImages = [...deletedImages, removedImage.url];
      setDeletedImages(newDeletedImages);

      // 부모 컴포넌트에 삭제된 이미지 URL 즉시 전달
      if (onDeletedImages) {
        onDeletedImages(newDeletedImages);
      }
    }

    // 새 이미지인 경우 미리보기 URL 해제
    if (!removedImage.isExisting && removedImage.previewUrl) {
      URL.revokeObjectURL(removedImage.previewUrl);
    }

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
