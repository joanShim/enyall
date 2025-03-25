"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { Concert } from "@/types/concert";
import { Tables } from "@/types/db";

type ConcertInfoProps = {
  concert: Concert | null;
};

export function ConcertInfo({ concert }: ConcertInfoProps) {
  if (!concert) return null;

  return (
    <div className="flex gap-4">
      <div className="h-24 w-24 flex-shrink-0 rounded-md bg-gray-200">
        {concert.poster_url ? (
          <Image
            src={concert.poster_url}
            alt={concert.title}
            width={96}
            height={96}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
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

        {concert.concert_date && (
          <div className="mt-1 text-sm text-gray-600">
            {format(new Date(concert.concert_date), "PPP", { locale: ko })}
          </div>
        )}
      </div>
    </div>
  );
}
