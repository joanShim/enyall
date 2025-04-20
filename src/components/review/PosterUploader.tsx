import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export interface PosterFile {
  file?: File;
  previewUrl: string;
  id: string;
  isExisting?: boolean;
  url?: string;
}

interface PosterUploaderProps {
  poster: PosterFile | null;
  onChange: (poster: PosterFile | null) => void;
  disabled?: boolean;
}

export function PosterUploader({
  poster,
  onChange,
  disabled = false,
}: PosterUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setIsLoading(true);
      const maxUploadSize = 5 * 1024 * 1024; // 5MB

      try {
        const file = files[0];

        // 파일 크기 검사
        if (file.size > maxUploadSize) {
          toast.error(
            "파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.",
          );
          return;
        }

        // 이미지 타입 검사
        if (!file.type.startsWith("image/")) {
          toast.error("이미지 파일만 업로드 가능합니다.");
          return;
        }

        // 미리보기 URL 생성
        const previewUrl = URL.createObjectURL(file);
        const id = uuidv4();

        onChange({
          file,
          previewUrl,
          id,
          isExisting: false,
        });
      } catch (error) {
        console.error("이미지 처리 중 오류:", error);
        toast.error("이미지 처리에 실패했습니다.");
      } finally {
        setIsLoading(false);
        // 입력 필드 초기화
        event.target.value = "";
      }
    },
    [onChange],
  );

  const removePoster = () => {
    if (poster && !poster.isExisting && poster.previewUrl) {
      URL.revokeObjectURL(poster.previewUrl);
    }
    onChange(null);
  };

  return (
    <div className="aspect-[3/4] max-w-[100px] overflow-hidden border">
      {poster ? (
        <div className="relative aspect-[3/4] bg-gray-100">
          <Image
            src={poster.previewUrl}
            alt="콘서트 포스터"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <button
            type="button"
            className="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white"
            onClick={removePoster}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="h-full w-full">
          <button
            type="button"
            className="h-full w-full"
            onClick={() => document.getElementById("poster-upload")?.click()}
            disabled={disabled || isLoading || !!poster}
          >
            🎤
          </button>
          <input
            id="poster-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            disabled={disabled || isLoading || !!poster}
          />
          {/* <p className="text-xs text-muted-foreground">
        5MB, JPG, PNG, GIF 파일 지원
      </p> */}
        </div>
      )}
    </div>
  );
}
