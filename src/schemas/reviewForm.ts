import * as z from "zod";

export const reviewFormSchema = z.object({
  // 콘서트 선택 단계
  concertId: z.string().min(1, "콘서트를 선택해주세요"),

  // 리뷰 작성 단계
  reviewContent: z.string().min(10, "리뷰는 최소 10자 이상 작성해주세요"),
});

// 새 콘서트 등록 스키마
export const newConcertSchema = z.object({
  title: z.string().min(1, "콘서트 제목을 입력해주세요"),
  artistId: z.string().min(1, "아티스트를 선택해주세요"),
  newArtistName: z.string().optional(),
  concertDate: z.date({
    required_error: "콘서트 날짜를 선택해주세요",
  }),
  venueId: z.string().min(1, "공연장을 선택해주세요"),
  newVenueName: z.string().optional(),
  newVenueAddress: z.string().optional(),
});

export type ReviewFormSchema = z.infer<typeof reviewFormSchema>;
export type NewConcertFormSchema = z.infer<typeof newConcertSchema>;
