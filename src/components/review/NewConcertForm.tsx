"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntitySelector } from "@/components/review/EntitySelector";
import { useGetArtists } from "@/hooks/useGetArtists";
import { useGetVenues } from "@/hooks/useGetVenues";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useReviewFormStore } from "@/store/reviewFormStore";
import { newConcertSchema } from "@/schemas/reviewForm";
import type { NewConcertFormSchema } from "@/schemas/reviewForm";
import TimePicker from "../ui/time-picker";
import DateInput from "../ui/date-input";

export default function NewConcertForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setData } = useReviewFormStore();
  const supabase = createBrowserSupabaseClient();
  const { artists, isLoading: isLoadingArtists } = useGetArtists();
  const { venues, isLoading: isLoadingVenues } = useGetVenues();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewConcertFormSchema>({
    resolver: zodResolver(newConcertSchema),
    defaultValues: {
      title: "",
      concertDate: undefined,
      startTime: "19:00", // 기본값 설정
    },
  });

  const createNewArtist = async (name: string): Promise<string | null> => {
    try {
      // 현재 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("로그인이 필요합니다");
        return null;
      }

      const { data, error } = await supabase
        .from("artists_pending")
        .insert({
          name_official: name,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success(`아티스트 "${name}"이(가) 추가되었습니다`);
      return data.id;
    } catch (error) {
      console.error("아티스트 추가 실패:", error);
      toast.error("아티스트 추가에 실패했습니다");
      return null;
    }
  };

  const createNewVenue = async (name: string): Promise<string | null> => {
    try {
      // 현재 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("로그인이 필요합니다");
        return null;
      }

      const { data, error } = await supabase
        .from("venues_pending")
        .insert({
          name,
          address: "", // 빈 주소로 설정
          created_by: user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success(`공연장 "${name}"이(가) 추가되었습니다`);
      return data.id;
    } catch (error) {
      console.error("공연장 추가 실패:", error);
      toast.error("공연장 추가에 실패했습니다");
      return null;
    }
  };

  const getDefaultTime = (date: Date) => {
    const day = date.getDay();
    if (day === 0) return "17:00"; // 일요일
    if (day === 6) return "18:00"; // 토요일
    return "19:00"; // 평일
  };

  const onSubmit = async (data: NewConcertFormSchema) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다");
      }

      // 1. concerts_pending에 먼저 등록
      const { data: newConcert, error: concertError } = await supabase
        .from("concerts_pending")
        .insert({
          title: data.title,
          venue_id: data.venueId,
          concert_date: data.concertDate.toISOString(),
          start_time: data.startTime,
          created_by: user.id,
          submitted_by: user.id,
        })
        .select("id")
        .single();

      if (concertError) throw concertError;

      // 2. concerts_artists_pending에 concert_pending_id로만 연결
      const { error: artistError } = await supabase
        .from("concerts_artists_pending")
        .insert({
          concert_pending_id: newConcert.id,
          artist_id: data.artistId,
          created_by: user.id,
          start_time: data.startTime,
          status: "pending",
        });

      if (artistError) throw artistError;

      toast.success("새 콘서트가 성공적으로 등록되었습니다");

      // 스토어에 콘서트 ID와 isPendingConcert 플래그 저장
      setData({
        concertId: newConcert.id,
        isPendingConcert: true, // 새로 추가
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

  const handleCancel = () => {
    router.push("/new/select-concert");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">콘서트 제목</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="콘서트 제목을 입력하세요"
                disabled={isSubmitting}
              />
            )}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>일자</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Controller
                name="concertDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date);
                      if (date) {
                        // 날짜가 변경되면 기본 시간 설정
                        const defaultTime = getDefaultTime(date);
                        setValue("startTime", defaultTime);
                      }
                    }}
                    // disabled={isSubmitting}
                  />
                )}
              />
              {errors.concertDate && (
                <p className="text-sm text-red-500">
                  {errors.concertDate.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">
                  {errors.startTime.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <EntitySelector
          type="artist"
          label="아티스트"
          control={control}
          entities={artists.map((a) => ({
            id: a.id,
            name: a.name_official || "",
          }))}
          isLoading={isLoadingArtists}
          onCreateNew={createNewArtist}
          newEntityFieldName="newArtistName"
          entityIdFieldName="artistId"
        />
        {errors.artistId && (
          <p className="text-sm text-red-500">{errors.artistId.message}</p>
        )}

        <EntitySelector
          type="venue"
          label="공연장"
          control={control}
          entities={venues.map((v) => ({ id: v.id, name: v.name }))}
          isLoading={isLoadingVenues}
          onCreateNew={createNewVenue}
          newEntityFieldName="newVenueName"
          entityIdFieldName="venueId"
        />
        {errors.venueId && (
          <p className="text-sm text-red-500">{errors.venueId.message}</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "콘서트 등록하기"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
        </div>
      </div>
    </form>
  );
}
