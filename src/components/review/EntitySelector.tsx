"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Control, Controller, Path } from "react-hook-form";

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
};

export function EntitySelector<T extends Record<string, unknown>>({
  label,
  control,
  entities,
  isLoading,
  onCreateNew,
  disabled = false,
  newEntityFieldName,
  entityIdFieldName,
}: EntitySelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newEntityName, setNewEntityName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 선택된 엔티티 이름 찾기
  const selectedEntity = entities.find(
    (entity) => entity.id === selectedEntityId,
  );

  // 검색어에 따라 필터링된 엔티티 목록
  const filteredEntities = entities.filter((entity) =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 팝오버가 열릴 때 input에 포커스
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // 새 엔티티 생성 처리
  const handleCreateNew = async () => {
    if (!newEntityName.trim()) {
      setError(`${label} 이름을 입력해주세요`);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      if (onCreateNew) {
        const newId = await onCreateNew(newEntityName);
        if (newId) {
          // control을 통해 값 설정
          control._formValues[entityIdFieldName as string] = newId;
          setSelectedEntityId(newId);
          setNewEntityName("");
          setShowCreateForm(false);
        }
      }
    } catch (err) {
      setError(`새 ${label} 추가 중 오류가 발생했습니다`);
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // 엔티티 선택 처리
  const handleSelectEntity = (entity: Entity) => {
    // control을 통해 값 설정
    control._formValues[entityIdFieldName as string] = entity.id;
    setSelectedEntityId(entity.id);
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>

        {showCreateForm ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Controller
                name={newEntityFieldName}
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex-1 space-y-2">
                    <Input
                      {...field}
                      value={newEntityName}
                      onChange={(e) => {
                        field.onChange(e);
                        setNewEntityName(e.target.value);
                      }}
                      disabled={isCreating || disabled}
                      placeholder={`새 ${label} 이름`}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  disabled={isCreating || disabled || !newEntityName.trim()}
                  onClick={handleCreateNew}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "추가"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewEntityName("");
                    setError(null);
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={disabled}
              >
                {selectedEntity ? selectedEntity.name : `${label} 선택...`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  placeholder={`${label} 검색...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />

                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">로딩 중...</span>
                  </div>
                ) : filteredEntities.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    <div className="">
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
                  </div>
                ) : (
                  <div className="space-y-2 py-2 text-center">
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? `찾으시는 ${label} 없나요?`
                        : `${label}를 검색해주세요`}
                    </p>
                    {searchTerm && onCreateNew && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => {
                          setShowCreateForm(true);
                          setNewEntityName(searchTerm);
                          setOpen(false);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        직접 입력하기
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Controller
          name={entityIdFieldName}
          control={control}
          render={({ field, fieldState }) => {
            // useEffect를 콜백 내부에서 사용하지 않고 field.value 변경 시 상태 업데이트
            if (field.value && field.value !== selectedEntityId) {
              setSelectedEntityId(field.value as string);
            }

            return (
              <>
                {fieldState.error && (
                  <p className="text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            );
          }}
        />
      </div>
    </div>
  );
}
