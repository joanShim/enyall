import * as z from "zod";

export const reviewFormSchema = z.object({
  // 콘서트 선택 단계
  concertId: z.string().min(1, "콘서트를 선택해주세요"),

  // 리뷰 작성 단계
  reviewContent: z.string().min(1, "리뷰는 최소 1자 이상 작성해주세요"),

  // 이미지 URLs
  reviewImages: z.array(z.string()).optional().default([]),
});

export const scheduleSchema = z.object({
  concertDate: z.date({
    required_error: "공연 날짜를 선택해주세요",
  }),
  startTime: z
    .string({
      required_error: "시작 시간을 입력해주세요",
    })
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "유효한 시간 형식이 아닙니다 (HH:MM)",
    ),
});

export const newConcertSchema = z.object({
  title: z.string().min(1, "콘서트 제목을 입력해주세요"),
  schedules: z
    .array(scheduleSchema)
    .min(1, "최소 하나의 공연 일정이 필요합니다"),
  artistId: z.string().min(1, "아티스트를 선택해주세요"),
  venueId: z.string().min(1, "공연장을 선택해주세요"),
  newArtistName: z.string().optional(),
  newVenueName: z.string().optional(),
});

export type ReviewFormSchema = z.infer<typeof reviewFormSchema>;
export type NewConcertFormSchema = z.infer<typeof newConcertSchema>;
