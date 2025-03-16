"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Artist } from "@/types/artist";

interface ArtistSelectorProps {
  artists: Artist[];
  initialSelectedArtists?: Artist[];
  onChange?: (artists: Artist[]) => void;
  maxSelections?: number;
  label?: string;
  name?: string;
}

export function ArtistSelector({
  artists,
  initialSelectedArtists = [],
  onChange,
  maxSelections = 5,
  label = "관심 아티스트",
  name = "selectedArtists",
}: ArtistSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>(
    initialSelectedArtists,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // 선택된 아티스트가 변경될 때 onChange 콜백 호출
  useEffect(() => {
    if (onChange) {
      onChange(selectedArtists);
    }
  }, [selectedArtists, onChange]);

  // 선택 가능한 아티스트 목록 (이미 선택된 아티스트 제외)
  const availableArtists = artists.filter(
    (artist) => !selectedArtists.some((selected) => selected.id === artist.id),
  );

  // 검색어에 따라 필터링된 아티스트 목록
  const filteredArtists = availableArtists.filter((artist) =>
    artist.official_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 아티스트 선택 처리
  const handleSelectArtist = (artist: Artist) => {
    if (selectedArtists.length < maxSelections) {
      setSelectedArtists([...selectedArtists, artist]);
      setSearchTerm("");
      setOpen(false);
    }
  };

  // 선택된 아티스트 제거
  const handleRemoveArtist = (artistId: string) => {
    setSelectedArtists(
      selectedArtists.filter((artist) => artist.id !== artistId),
    );
  };

  // 팝오버가 열릴 때 input에 포커스
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="space-y-2">
      <Label>
        {label} {selectedArtists.length > 0 && `(${selectedArtists.length})`}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={selectedArtists.length >= maxSelections}
          >
            아티스트 선택...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2">
          <div className="space-y-2">
            <Input
              ref={inputRef}
              placeholder="아티스트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />

            {filteredArtists.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <div className="">
                  {filteredArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleSelectArtist(artist)}
                    >
                      {artist.official_name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-sm text-gray-500">
                {searchTerm
                  ? "검색 결과가 없습니다"
                  : "아티스트를 검색해주세요"}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* 선택된 아티스트 뱃지 */}
      {selectedArtists.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedArtists.map((artist) => (
            <Badge
              key={artist.id}
              variant="outline"
              className="flex cursor-pointer items-center gap-1"
              onClick={() => handleRemoveArtist(artist.id)}
            >
              {artist.korean_name || artist.official_name}
            </Badge>
          ))}
        </div>
      )}

      {selectedArtists.length >= maxSelections && (
        <p className="mt-1 text-sm text-amber-600">
          최대 {maxSelections}개의 아티스트만 선택할 수 있습니다.
        </p>
      )}

      {/* 폼 제출을 위한 hidden input 추가 */}
      {selectedArtists.map((artist) => (
        <input key={artist.id} type="hidden" name={name} value={artist.id} />
      ))}
    </div>
  );
}
