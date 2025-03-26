"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabGroup } from "@/components/ui/tab-group";
import { useConcertSearch } from "@/hooks/useConcertSearch";
import { useReviewFormStore } from "@/store/reviewFormStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQueryState } from "nuqs";

export default function SelectConcertForm() {
  const router = useRouter();
  const { setData } = useReviewFormStore();
  const [searchQuery, setSearchQuery] = useQueryState("search");
  const [typeQuery, setTypeQuery] = useQueryState("type", {
    defaultValue: "artist",
  });

  const {
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    concerts,
    isLoading,
    debouncedSearchTerm,
  } = useConcertSearch(searchQuery || "", typeQuery as "artist" | "concert");

  const tabs = ["아티스트", "공연명"];
  const currentTab = searchType === "artist" ? "아티스트" : "공연명";

  const handleTabChange = (tab: string) => {
    const newType = tab === "아티스트" ? "artist" : "concert";
    setSearchType(newType);
    setTypeQuery(newType);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchQuery(value || null);
  };

  const handleConcertSelect = (concertId: string) => {
    setData({ concertId });
    router.push("/new/write-review");
  };

  const handleCreateNewConcert = () => {
    router.push("/new/new-concert");
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder={searchType === "artist" ? "아티스트" : "공연명"}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {searchQuery && searchQuery.trim() !== "" && (
        <TabGroup
          tabs={tabs}
          selectedTab={currentTab}
          onChange={handleTabChange}
          className="mt-4"
        />
      )}

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading &&
        debouncedSearchTerm.length >= 2 &&
        concerts.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

      {!isLoading && concerts.length > 0 && (
        <div className="space-y-4">
          {concerts.map((concert) => (
            <div
              key={concert.id}
              className="flex w-full cursor-pointer items-start gap-4 border p-4 hover:bg-gray-50"
              onClick={() => handleConcertSelect(concert.id)}
            >
              <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-200">
                {concert.poster_url ? (
                  <Image
                    src={concert.poster_url}
                    alt={concert.title}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">{concert.title}</h3>
                <div className="line-clamp-1 text-xs text-gray-500">
                  {concert.artists.length > 0
                    ? concert.artists
                        .map((artist) => artist.name_official)
                        .join(", ")
                    : "아티스트 정보 없음"}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={16} />
                  <p>{concert.venue?.name || "공연장 정보 없음"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={handleCreateNewConcert}
      >
        <Plus className="mr-2 h-4 w-4" />새 콘서트 등록
      </Button>
    </div>
  );
}
