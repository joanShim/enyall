"use client";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Control,
  Controller,
  Path,
  ControllerFieldState,
} from "react-hook-form";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";

type Entity = {
  id: string;
  name: string;
};

type EntitySelectorProps<T extends Record<string, unknown>> = {
  type: "artist" | "concert" | "venue";
  label: string;
  control: Control<T>;
  entities: Entity[];
  isLoading: boolean;
  onCreateNew?: (name: string) => Promise<string | null>;
  dependsOn?: { field: string; value: unknown };
  disabled?: boolean;
  newEntityFieldName: Path<T>;
  entityIdFieldName: Path<T>;
  onEntityCreated?: (entity: Entity) => void;
};

export function EntitySelector<T extends Record<string, unknown>>({
  type,
  label,
  control,
  entities,
  isLoading,
  onCreateNew,
  disabled = false,
  entityIdFieldName,
  onEntityCreated,
}: EntitySelectorProps<T>) {
  // 상태 관리
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [localEntities, setLocalEntities] = useState<Entity[]>(entities);
  const [fieldState, setFieldState] = useState<ControllerFieldState | null>(
    null,
  );
  const [controllerValue, setControllerValue] = useState<unknown>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createBrowserSupabaseClient();

  // entities prop이 변경될 때 localEntities 업데이트
  useEffect(() => {
    setLocalEntities(entities);
  }, [entities]);

  // fieldState의 에러를 formError 상태로 업데이트
  useEffect(() => {
    if (fieldState?.error?.message) {
      setFormError(fieldState.error.message);
    }
  }, [fieldState]);

  // Controller로부터 전달받은 값을 처리
  useEffect(() => {
    if (
      controllerValue &&
      typeof controllerValue === "string" &&
      controllerValue !== selectedEntityId
    ) {
      setSelectedEntityId(controllerValue);
    }
  }, [controllerValue, selectedEntityId]);

  // fieldState 업데이트를 위한 useEffect 추가
  useEffect(() => {
    if (fieldState) {
      setFieldState(fieldState);
    }
  }, [fieldState]);

  // controllerValue 업데이트를 위한 useEffect 추가
  useEffect(() => {
    if (controllerValue !== undefined) {
      setControllerValue(controllerValue);
    }
  }, [controllerValue]);

  // 선택된 엔티티 이름 찾기
  const selectedEntity = localEntities.find(
    (entity) => entity.id === selectedEntityId,
  );

  // 검색어에 따라 필터링된 엔티티 목록
  const filteredEntities = localEntities.filter((entity) =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 엔티티 목록 새로고침
  const refreshEntities = useCallback(async () => {
    try {
      if (type === "artist") {
        const { data } = await supabase
          .from("artists")
          .select("*")
          .order("name_official");

        if (data) {
          setLocalEntities(
            data.map((artist: Tables<"artists">) => ({
              id: artist.id,
              name: artist.name_official,
            })),
          );
        }
      } else if (type === "venue") {
        const { data } = await supabase
          .from("venues")
          .select("*")
          .order("name");

        if (data) {
          setLocalEntities(
            data.map((venue: Tables<"venues">) => ({
              id: venue.id,
              name: venue.name,
            })),
          );
        }
      }
    } catch (err) {
      console.error(`${label} 목록 새로고침에 실패했습니다:`, err);
    }
  }, [type, label, supabase]);

  // 새 엔티티 생성 처리
  const handleCreateNew = async () => {
    if (!searchTerm.trim()) {
      setFormError(`${label} 이름을 입력해주세요`);
      return;
    }

    setIsCreating(true);
    setFormError(null);

    try {
      if (onCreateNew) {
        const newId = await onCreateNew(searchTerm.trim());
        if (newId) {
          // 낙관적 UI 업데이트: 로컬 엔티티 목록에 바로 추가
          const newEntity = { id: newId, name: searchTerm.trim() };
          setLocalEntities((prev) => [...prev, newEntity]);

          // 폼 값 설정 및 상태 업데이트
          handleValueChange(newId);
          setSearchTerm("");
          setOpen(false);

          // 콜백 호출
          if (onEntityCreated) {
            onEntityCreated(newEntity);
          }

          // 백그라운드에서 전체 목록 새로고침
          refreshEntities();
        }
      }
    } catch (err) {
      setFormError(`새 ${label} 추가 중 오류가 발생했습니다`);
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // 엔티티 선택 처리
  const handleSelectEntity = (entity: Entity) => {
    handleValueChange(entity.id);
    setSearchTerm("");
    setOpen(false);
  };

  // 폼 필드 값 변경 처리
  const handleValueChange = useCallback(
    (value: string | null) => {
      // 상태 업데이트
      setSelectedEntityId(value);

      // 폼 값 업데이트 (null이면 undefined로 설정)
      if (value) {
        control._formValues[entityIdFieldName as string] = value;
      } else {
        control._formValues[entityIdFieldName as string] = undefined;
      }
    },
    [control, entityIdFieldName],
  );

  // 검색어 변경 시 자동으로 팝오버 열기
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() && !open) {
      setOpen(true);
    }
    // 에러 메시지 초기화
    if (formError) {
      setFormError(null);
    }
  };

  // 선택된 엔티티 지우기
  const clearSelection = () => {
    handleValueChange(null);
    setSearchTerm("");
  };

  // input에 포커스가 주어질 때 자동으로 팝오버 열기
  const handleInputFocus = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  // 에러 메시지 렌더링 함수
  const renderErrorMessage = (message: string | null) => {
    if (!message) return null;
    return <p className="mt-1 text-center text-sm text-red-500">{message}</p>;
  };

  // 새 엔티티 추가 버튼 로딩 상태 컨텐츠
  const renderAddButtonContent = () => {
    if (isCreating) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          추가 중...
        </>
      );
    }

    return (
      <>
        <Plus className="mr-2 h-4 w-4" />
        {`"${searchTerm}" 새로 추가하기`}
      </>
    );
  };

  // 새 엔티티 추가 버튼 렌더링
  const renderAddNewButton = () => {
    return (
      <Button
        type="button"
        variant="outline"
        className="mt-2 w-full"
        onClick={handleCreateNew}
        disabled={isCreating || disabled}
      >
        {renderAddButtonContent()}
      </Button>
    );
  };

  // 검색 결과 없음 화면 렌더링
  const renderEmptyResults = () => {
    // 검색어가 있는 경우
    if (searchTerm.trim()) {
      return (
        <>
          <div className="py-2 text-center text-sm text-gray-500">
            검색 결과가 없습니다
          </div>
          {onCreateNew && renderAddNewButton()}
        </>
      );
    }

    // 검색어가 없는 경우
    return (
      <div className="py-2 text-center text-sm text-gray-500">
        {`${label}를 검색해주세요`}
      </div>
    );
  };

  // 선택된 엔티티 렌더링
  const renderSelectedEntity = () => {
    if (!selectedEntity) return null;

    return (
      <div
        className="flex h-10 items-center py-1.5 pr-2 text-sm"
        onClick={() => setOpen(true)}
      >
        <div className="flex flex-1 items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="inline-flex items-center whitespace-nowrap py-0.5 text-base font-medium underline"
          >
            {selectedEntity.name}
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="ml-1 text-gray-400 hover:text-gray-600"
          disabled={disabled}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // 팝오버 내부 콘텐츠 렌더링 함수
  const renderPopoverEntityList = () => {
    // 로딩 중인 경우
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2">로딩 중...</span>
        </div>
      );
    }

    // 검색 결과가 있는 경우
    if (filteredEntities.length > 0) {
      return (
        <div className="max-h-60 overflow-y-auto">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-gray-100"
              onClick={() => handleSelectEntity(entity)}
            >
              {entity.name}
            </div>
          ))}
        </div>
      );
    }

    // 검색 결과가 없는 경우
    return <div className="space-y-2">{renderEmptyResults()}</div>;
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger asChild>
            <div className="relative">
              {selectedEntity ? (
                renderSelectedEntity()
              ) : (
                <Input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  onFocus={handleInputFocus}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                  }}
                  placeholder={`${label} 검색...`}
                  disabled={disabled}
                  className="w-full border-none pl-0 pr-8 text-sm placeholder:text-sm"
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-2"
            align="start"
            sideOffset={5}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (e.target === inputRef.current) {
                e.preventDefault();
              }
            }}
          >
            <div className="space-y-2">
              {renderPopoverEntityList()}
              {renderErrorMessage(formError)}
            </div>
          </PopoverContent>
        </div>
      </Popover>

      {/* Controller는 폼 값과 상태 동기화를 위해 사용 */}
      <Controller
        name={entityIdFieldName}
        control={control}
        render={() => <></>}
      />
    </div>
  );
}
