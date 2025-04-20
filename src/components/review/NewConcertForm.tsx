import { EntitySelector } from "@/components/review/EntitySelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetArtists } from "@/hooks/useGetArtists";
import { useGetVenues } from "@/hooks/useGetVenues";
import type { NewConcertFormSchema } from "@/schemas/reviewForm";
import { newConcertSchema } from "@/schemas/reviewForm";
import { useReviewFormStore } from "@/store/reviewFormStore";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DateTimeSelector } from "./DateTimePicker";
import { PosterUploader, PosterFile } from "@/components/review/PosterUploader";
import { v4 as uuidv4 } from "uuid";

export default function NewConcertForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [poster, setPoster] = useState<PosterFile | null>(null);
  const router = useRouter();
  const { setData } = useReviewFormStore();
  const supabase = createBrowserSupabaseClient();
  const {
    artists,
    isLoading: isLoadingArtists,
    mutate: mutateArtists,
  } = useGetArtists();
  const {
    venues,
    isLoading: isLoadingVenues,
    mutate: mutateVenues,
  } = useGetVenues();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewConcertFormSchema>({
    resolver: zodResolver(newConcertSchema),
    defaultValues: {
      title: "",
      schedules: [],
      artistId: undefined,
      venueId: undefined,
    },
  });

  // 일정 데이터 변경 처리 함수
  const handleDateTimeChange = (
    entries: { id: string; date?: Date; time?: string }[],
  ) => {
    // 폼 데이터 업데이트
    const validSchedules = entries
      .filter((entry) => entry.date) // 날짜가 있는 엔트리만 필터링
      .map((entry) => ({
        concertDate: entry.date as Date, // 필터링했으므로 타입 변환 안전
        startTime: entry.time || "19:00",
      }));

    setValue("schedules", validSchedules);
  };

  // 이미지 파일 업로드 함수
  const uploadPosterToStorage = async (): Promise<string | null> => {
    if (!poster) return null;

    if (poster.isExisting) return poster.previewUrl;

    try {
      if (!poster.file) return null;

      // 파일 이름 생성
      const fileExt = poster.file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabase Storage에 업로드
      const { error } = await supabase.storage
        .from("posters")
        .upload(filePath, poster.file);

      if (error) {
        console.error(`포스터 업로드 실패: ${error.message}`);
        return null;
      }

      // 업로드된 이미지 URL 가져오기
      const { data: urlData } = supabase.storage
        .from("posters")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("포스터 업로드 중 오류:", error);
      return null;
    }
  };

  // 새로운 공연장 추가 함수
  const createNewVenue = useCallback(
    async (name: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase
          .from("venues")
          .insert({
            name,
            address: "", // 빈 주소로 설정
          })
          .select("id")
          .single();

        if (error) throw error;

        toast.success(`공연장 "${name}"이(가) 추가되었습니다`);

        // 공연장 목록 캐시 무효화 및 다시 불러오기
        mutateVenues();

        return data.id;
      } catch (error) {
        console.error("공연장 추가 실패:", error);
        toast.error("공연장 추가에 실패했습니다");
        return null;
      }
    },
    [supabase, mutateVenues],
  );

  // 새로운 아티스트 추가 함수
  const createNewArtist = useCallback(
    async (name: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase
          .from("artists")
          .insert({
            name_official: name,
          })
          .select("id")
          .single();

        if (error) throw error;

        toast.success(`아티스트 "${name}"이(가) 추가되었습니다`);

        // 아티스트 목록 캐시 무효화 및 다시 불러오기
        mutateArtists();

        return data.id;
      } catch (error) {
        console.error("아티스트 추가 실패:", error);
        toast.error("아티스트 추가에 실패했습니다");
        return null;
      }
    },
    [supabase, mutateArtists],
  );

  const onSubmit = async (data: NewConcertFormSchema) => {
    if (!data.schedules || data.schedules.length === 0) {
      toast.error("최소 하나 이상의 공연 일정을 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다");
      }

      // 포스터 이미지 업로드
      const posterUrl = await uploadPosterToStorage();

      // concerts 테이블에 등록
      const { data: newConcert, error: concertError } = await supabase
        .from("concerts")
        .insert({
          title: data.title,
          venue_id: data.venueId,
          poster_url: posterUrl,
        })
        .select("id")
        .single();

      if (concertError) throw concertError;

      // 모든 일정에 대해 concert_schedules 테이블에 등록
      const scheduleInserts = data.schedules.map((schedule) => ({
        concert_id: newConcert.id,
        schedule_date: schedule.concertDate.toISOString().split("T")[0], // YYYY-MM-DD 형식
        start_time: schedule.startTime,
      }));

      const { error: scheduleError } = await supabase
        .from("concert_schedules")
        .insert(scheduleInserts);

      if (scheduleError) throw scheduleError;

      // concerts_artists 테이블에 연결 (트리거에 의해 artists_json이 자동 업데이트됨)
      const { error: artistError } = await supabase
        .from("concerts_artists")
        .insert({
          concert_id: newConcert.id,
          artist_id: data.artistId,
        });

      if (artistError) throw artistError;

      toast.success("새 콘서트가 성공적으로 등록되었습니다");

      // 스토어에 콘서트 ID 저장
      setData({
        concertId: newConcert.id,
      });

      // 리뷰 작성 페이지로 이동
      router.push("/new/write-review");
    } catch (error) {
      console.error("콘서트 등록 실패:", error);

      if (error instanceof Error) {
        toast.error(error.message || "콘서트 등록에 실패했습니다");
      } else {
        toast.error("콘서트 등록에 실패했습니다");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 divide-y border-y">
        <div className="p-2 py-4">
          <Label>포스터 이미지</Label>
          <PosterUploader
            poster={poster}
            onChange={setPoster}
            disabled={isSubmitting}
          />
        </div>

        <div className="p-2 py-4">
          <Label htmlFor="title">타이틀</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="콘서트 제목을 입력하세요"
                disabled={isSubmitting}
                className="border-none p-0"
              />
            )}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div className="p-2 py-4">
          <Label htmlFor="artistId">아티스트</Label>
          <Controller
            name="artistId"
            control={control}
            render={() => (
              <EntitySelector
                type="artist"
                label="아티스트"
                control={control}
                entities={artists.map((a) => ({
                  id: a.id,
                  name: a.name_official,
                }))}
                isLoading={isLoadingArtists}
                onCreateNew={createNewArtist}
                newEntityFieldName="newArtistName"
                entityIdFieldName="artistId"
                disabled={isSubmitting}
                onEntityCreated={(entity) => {
                  toast.success(
                    `아티스트 "${entity.name}"이(가) 선택되었습니다`,
                  );
                }}
              />
            )}
          />
          {errors.artistId && (
            <p className="text-sm text-red-500">{errors.artistId.message}</p>
          )}
        </div>

        <div className="p-2 py-4">
          <div className="flex items-center justify-between">
            <Label>공연 일정</Label>
          </div>
          <div className="mt-2">
            <DateTimeSelector onEntriesChange={handleDateTimeChange} />
          </div>
          {errors.schedules && (
            <p className="mt-2 text-sm text-red-500">
              {Array.isArray(errors.schedules)
                ? "모든 일정에 날짜와 시간을 입력해주세요"
                : errors.schedules.message}
            </p>
          )}
        </div>

        <div className="p-2 py-4">
          <Label htmlFor="venueId">공연장</Label>
          <EntitySelector
            type="venue"
            label="공연장"
            control={control}
            entities={venues.map((v) => ({ id: v.id, name: v.name }))}
            isLoading={isLoadingVenues}
            onCreateNew={createNewVenue}
            newEntityFieldName="newVenueName"
            entityIdFieldName="venueId"
            disabled={isSubmitting}
            onEntityCreated={(entity) => {
              toast.success(`공연장 "${entity.name}"이(가) 선택되었습니다`);
            }}
          />
          {errors.venueId && (
            <p className="text-sm text-red-500">{errors.venueId.message}</p>
          )}
          {errors.newVenueName && (
            <p className="text-sm text-red-500">
              {errors.newVenueName.message}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "콘서트 등록하기"}
          </Button>
        </div>
      </div>
    </form>
  );
}