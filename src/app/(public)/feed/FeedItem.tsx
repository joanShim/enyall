import Image from "next/image";
import { Review } from "@/types/review";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface FeedItemProps {
  review: Review;
}

export default function FeedItem({ review }: FeedItemProps) {
  const timeSince = review.created_at
    ? formatDistanceToNow(new Date(review.created_at), {
        locale: ko,
        addSuffix: true,
      })
    : "";

  return (
    <Link href={`/feed/${review.id}`}>
      <div className="p-2 transition hover:bg-gray-50">
        <div className="profile mb-3 flex items-center gap-3">
          <div className="profile-image relative h-10 w-10 overflow-hidden rounded-full">
            {review.user?.avatar_url ? (
              <Image
                src={review.user.avatar_url}
                alt="프로필"
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200" />
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <div>{review.user?.name || "익명"}</div>
            <div className="text-xs text-gray-500">{timeSince}</div>
          </div>
        </div>

        <div className="concert_info mb-2">
          <div className="concert_name mb-1 line-clamp-1 text-xs font-medium">
            {review.concert?.title}
          </div>
          <div className="concert_location text-xs text-gray-600">
            {review.concert?.venue?.name}
          </div>
        </div>

        <div className="review">
          <div className="line-clamp-2 text-sm">{review.content}</div>

          {review.images && review.images.length > 0 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2">
              {review.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative h-40 min-w-[160px] flex-shrink-0 overflow-hidden rounded-md"
                >
                  <Image
                    src={imageUrl}
                    alt={`리뷰 이미지 ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 160px, 200px"
                    className="object-cover"
                    priority
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
