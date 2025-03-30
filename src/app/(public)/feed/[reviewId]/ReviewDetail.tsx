import { Review } from "@/types/review";
import Image from "next/image";
import { formatDate } from "@/utils/dateFormat";
import { Separator } from "@/components/ui/separator";

type ArtistJson = {
  name_official: string;
  [key: string]: unknown;
};

export default function ReviewDetail({ review }: { review: Review }) {
  const concert = review.concert;
  const artistNames = concert?.artists_json
    ? (concert.artists_json as ArtistJson[])
        .map((artist) => artist.name_official)
        .join(", ")
    : "아티스트 정보 없음";

  const concertDate = concert?.concert_schedules?.[0]?.schedule_date
    ? formatDate(concert.concert_schedules[0].schedule_date)
    : "날짜 정보 없음";

  return (
    <section className="flex flex-col gap-4">
      <div className="info flex gap-4">
        <div className="relative aspect-[3/4] overflow-hidden border bg-gray-100">
          {concert?.poster_url ? (
            <Image
              src={concert.poster_url}
              alt={concert.title}
              fill
              sizes="30vw, 20vw"
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
            {concert?.title}
          </h3>
          <p className="line-clamp-1 text-gray-600">{artistNames}</p>
          <p className="text-gray-500">{concert?.venue?.name}</p>
          <span>{concertDate}</span>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <div className="bg-gray-50 p-3">
          <p className="text-sm">{review.content}</p>
        </div>
        {/* {review.rating && <p className="text-sm">평점: {review.rating}/5</p>} */}
      </div>
    </section>
  );
}
