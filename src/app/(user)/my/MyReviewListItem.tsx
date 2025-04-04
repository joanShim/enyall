import { MyReviewListItemProps } from "@/types/review";
import { ArtistJson } from "@/types/concert";
import { formatDate } from "@/utils/dateFormat";
import Image from "next/image";
import Link from "next/link";

interface Schedule {
  schedule_date: string;
  start_time: string;
}

export default function MyReviewListItem({ review }: MyReviewListItemProps) {
  const concert = review.concert;
  if (!concert) return null;

  // 아티스트 이름 표시 형식 개선
  const artistNames = concert.artists_json
    ? (concert.artists_json as ArtistJson[])
        .map((artist) => artist.name_ko || artist.name_official)
        .join(", ")
    : "-";

  // 콘서트 날짜 표시 - 첫 번째 스케줄 사용
  const schedules = (concert.concert_schedules as Schedule[]) || [];
  const concertDate =
    schedules.length > 0 ? formatDate(schedules[0].schedule_date) : "날짜 미정";

  return (
    <Link
      href={`/feed/${review.id}`}
      className="group flex flex-col gap-2 overflow-hidden border-b p-2 tracking-tight transition odd:border-r"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden border bg-gray-100">
        {concert.poster_url ? (
          <Image
            src={concert.poster_url}
            alt={concert.title}
            fill
            sizes="(max-width: 768px) 30vw, 20vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-1 text-xs">
        <h3 className="mb-auto line-clamp-2 text-sm font-bold tracking-tighter">
          {concert.title}
        </h3>
        <p className="line-clamp-1 text-gray-600">{artistNames}</p>
        <p className="text-gray-500">{concert.venue?.name}</p>
        <span>{concertDate}</span>
      </div>
    </Link>
  );
}
