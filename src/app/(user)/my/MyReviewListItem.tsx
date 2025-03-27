import Image from "next/image";
import Link from "next/link";
import { MyReviewListItemProps } from "@/types/review";

export default function MyReviewListItem({ review }: MyReviewListItemProps) {
  const concert = review.concert;
  if (!concert) return null;

  return (
    <Link
      href={`/feed/${review.id}`}
      className="group flex gap-2 overflow-hidden border-y p-2 tracking-tight transition"
    >
      <div className="relative aspect-[3/4] w-1/2 overflow-hidden bg-gray-100">
        {concert.poster_url ? (
          <Image
            src={concert.poster_url}
            alt={concert.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-bold">{concert.title}</h3>
        <p className="text-xs text-gray-500">
          {concert.artists_json?.map((artist) => artist.name_ko).join(", ")}
        </p>
        <p className="text-xs text-gray-500">{concert.venue?.name}</p>
      </div>
    </Link>
  );
}
