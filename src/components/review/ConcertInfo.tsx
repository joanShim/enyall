"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Concert } from "@/types/concert";
import { Tables } from "@/types/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConcertInfoProps = {
  concert: Concert | null;
  onScheduleSelect?: (scheduleId: string) => void;
  selectedScheduleId?: string;
};

export function ConcertInfo({
  concert,
  onScheduleSelect,
  selectedScheduleId,
}: ConcertInfoProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");

  // 시작 시간 정보 가져오기
  const schedules = useMemo(
    () => concert?.concert_schedules || [],
    [concert?.concert_schedules],
  );

  // 초기 선택된 스케줄 설정
  useEffect(() => {
    if (
      selectedScheduleId &&
      schedules.some((s) => s.id === selectedScheduleId)
    ) {
      setSelectedSchedule(selectedScheduleId);
    } else if (schedules.length > 0) {
      setSelectedSchedule(schedules[0].id);
    }
  }, [selectedScheduleId, schedules]);

  if (!concert) return null;

  const currentSchedule =
    schedules.find((s) => s.id === selectedSchedule) || schedules[0];
  const startTime = currentSchedule?.start_time;

  const handleScheduleChange = (scheduleId: string) => {
    setSelectedSchedule(scheduleId);
    onScheduleSelect?.(scheduleId);
  };

  return (
    <div className="flex gap-4">
      <div className="h-24 w-16 flex-shrink-0 rounded-md bg-gray-200">
        {concert.poster_url ? (
          <Image
            src={concert.poster_url}
            alt={concert.title}
            width={64}
            height={96}
            className="aspect-[2/3] rounded-md object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium">{concert.title}</h3>

        {concert.artists && concert.artists.length > 0 ? (
          <div className="truncate text-xs text-gray-600">
            {concert.artists
              .map(
                (item: { artist?: Tables<"artists"> }) =>
                  item.artist?.name_official,
              )
              .join(", ")}
          </div>
        ) : concert.artists_json &&
          Array.isArray(concert.artists_json) &&
          concert.artists_json.length > 0 ? (
          <div className="line-clamp-1 text-xs text-gray-600">
            {(
              concert.artists_json as Array<{
                name_official?: string;
              }>
            )
              .slice(0, 5)
              .map((artist) => artist.name_official || "")
              .filter((name) => name)
              .join(", ")}
            {concert.artists_json.length > 5 &&
              ` +${concert.artists_json.length - 5}명`}
          </div>
        ) : (
          <div className="line-clamp-1 text-xs text-gray-600">
            아티스트 정보 없음
          </div>
        )}

        {concert.venue && (
          <div className="mt-1 text-sm text-gray-600">{concert.venue.name}</div>
        )}

        {/* 스케줄 선택 UI */}
        {schedules.length > 0 && (
          <div className="mt-2">
            <Select
              value={selectedSchedule}
              onValueChange={handleScheduleChange}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="공연 일정을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {format(
                      new Date(schedule.schedule_date),
                      "yyyy-MM-dd (EE)",
                      { locale: ko },
                    )}{" "}
                    {schedule.start_time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 선택된 스케줄의 날짜와 시간 표시 */}
        {currentSchedule && (
          <div className="mt-1 text-sm text-gray-600">
            {format(new Date(currentSchedule.schedule_date), "PPP", {
              locale: ko,
            })}
            {startTime && (
              <span className="ml-2">
                {format(new Date(`2000-01-01T${startTime}`), "HH:mm")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
