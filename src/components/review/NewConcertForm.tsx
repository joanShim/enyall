"use client";

import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";

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
    getValues,
  } = useForm<NewConcertFormSchema>({
    resolver: zodResolver(newConcertSchema),
    defaultValues: {
      title: "",
      schedules: [
        {
          concertDate: undefined,
          startTime: "19:00", // 기본값 설정
        },
      ],
    },
  });

  // 일정 필드 배열 관리를 위한 useFieldArray 훅 사용
  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  const createNewArtist = async (name: string): Promise<string | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("로그인이 필요합니다");
        return null;
      }

      const { data, error } = await supabase
        .from("artists")
        .insert({
          name_official: name,
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
      const { data, error } = await supabase
        .from("venues")
        .insert({
          name,
          address: "", // 빈 주소로 설정
        })
        .select("id")
        .single();

      if (error) throw error;

      // 새 공연장을 venues 배열에 추가
      venues.push({
        id: data.id,
        name: name,
        address: "",
      });

      // 명시적으로 venueId 필드 값 설정
      setValue("venueId", data.id);

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

      // concerts 테이블에 등록 (artists_json 필드 제거)
      const { data: newConcert, error: concertError } = await supabase
        .from("concerts")
        .insert({
          title: data.title,
          venue_id: data.venueId,
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

  const handleCancel = () => {
    router.push("/new/select-concert");
  };

  // 새 일정 추가 함수
  const addSchedule = () => {
    const schedules = getValues("schedules");
    let newDate;

    if (schedules?.length > 0 && schedules[schedules.length - 1].concertDate) {
      // 마지막 일정의 다음 날짜 계산
      newDate = new Date(schedules[schedules.length - 1].concertDate);
      newDate.setDate(newDate.getDate() + 1);
    } else {
      // 첫 번째 일정이거나 날짜가 없는 경우 현재 날짜 사용
      newDate = new Date();
    }

    append({
      concertDate: newDate,
      startTime: getDefaultTime(newDate),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-8">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>공연 일정</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSchedule}
              disabled={isSubmitting}
            >
              <Plus className="mr-2 h-4 w-4" /> 일정 추가
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">{index + 1}일차</h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="mb-1 block">날짜</Label>
                  <Controller
                    name={`schedules.${index}.concertDate`}
                    control={control}
                    render={({ field }) => (
                      <DateInput
                        value={field.value}
                        onChange={(date) => {
                          field.onChange(date);
                          if (date) {
                            // 날짜가 변경되면 기본 시간 설정
                            const defaultTime = getDefaultTime(date);
                            setValue(
                              `schedules.${index}.startTime`,
                              defaultTime,
                            );
                          }
                        }}
                      />
                    )}
                  />
                  {errors.schedules?.[index]?.concertDate && (
                    <p className="text-sm text-red-500">
                      {errors.schedules[index]?.concertDate?.message}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <Label className="mb-1 block">시작 시간</Label>
                  <Controller
                    name={`schedules.${index}.startTime`}
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.schedules?.[index]?.startTime && (
                    <p className="text-sm text-red-500">
                      {errors.schedules[index]?.startTime?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
