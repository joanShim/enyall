"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcertSearch } from "@/hooks/useConcertSearch";
import { useRouter, useSearchParams } from "next/navigation";

export default function ConcertSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    searchTerm,
    setSearchTerm,
    concerts,
    isLoading,
    debouncedSearchTerm,
  } = useConcertSearch();

  const handleConcertSelect = (concertId: string) => {
    // URL 파라미터로 선택된 콘서트 ID 전달
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedConcertId", concertId);
    router.push(`?${params.toString()}`);
  };

  const handleCreateNew = () => {
    // URL 파라미터로 새 콘서트 생성 모드 전달
    const params = new URLSearchParams(searchParams.toString());
    params.set("createNewConcert", "true");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="공연, 아티스트 또는 공연장 검색"
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading &&
        debouncedSearchTerm.length >= 2 &&
        concerts.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

      {!isLoading && concerts.length > 0 && (
        <div className="space-y-2">
          {concerts.map((concert) => (
            <div
              key={concert.id}
              className="w-full cursor-pointer rounded-md border p-4 hover:bg-gray-50"
              onClick={() => handleConcertSelect(concert.id)}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{concert.title}</h3>
                  <div className="text-sm text-gray-500">
                    {concert.venue?.name || "공연장 정보 없음"}
                  </div>
                  <div className="mt-1 truncate text-sm">
                    {concert.artists.length > 0
                      ? concert.artists
                          .map((artist) => artist.name_official)
                          .join(", ")
                      : "아티스트 정보 없음"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 콘서트 추가 버튼 */}
      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={handleCreateNew}
          className="text-xs hover:underline"
        >
          찾는 공연이 없나요? 새 공연 추가하기
        </button>
      </div>
    </div>
  );
}
