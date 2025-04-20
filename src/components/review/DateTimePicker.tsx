"use client";

import { useState, useEffect } from "react";
import { CircleX, Plus } from "lucide-react";
import { addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { DatePicker } from "../ui/date-picker";
import { TimePicker } from "../ui/time-picker";

interface DateTimeEntry {
  id: string;
  date: Date | undefined;
  time: string | undefined;
}

interface DateTimeSelectorProps {
  onEntriesChange?: (entries: DateTimeEntry[]) => void;
  initialEntries?: DateTimeEntry[];
}

export function DateTimeSelector({
  onEntriesChange,
  initialEntries,
}: DateTimeSelectorProps) {
  const [entries, setEntries] = useState<DateTimeEntry[]>(
    initialEntries || [{ id: "1", date: undefined, time: "18:00" }],
  );

  // entries가 변경될 때 상위 컴포넌트에 알림
  useEffect(() => {
    if (onEntriesChange) {
      onEntriesChange(entries);
    }
  }, [entries, onEntriesChange]);

  const addEntry = () => {
    const newId = String(entries.length + 1);
    const lastEntry = entries[entries.length - 1];

    // 마지막 항목에 날짜가 있으면 다음 날짜로 설정, 없으면 undefined
    const newDate = lastEntry.date ? addDays(lastEntry.date, 1) : undefined;

    setEntries([
      ...entries,
      {
        id: newId,
        date: newDate,
        time: "18:00", // 시간은 항상 오후 6시로 설정
      },
    ]);
  };

  const updateDate = (id: string, date: Date | undefined) => {
    setEntries(
      entries.map((entry) => (entry.id === id ? { ...entry, date } : entry)),
    );
  };

  const updateTime = (id: string, time: string | undefined) => {
    setEntries(
      entries.map((entry) => (entry.id === id ? { ...entry, time } : entry)),
    );
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex flex-nowrap items-center gap-3">
          <div className="flex shrink-0 items-center">
            <span className="text-xs font-medium">DAY {index + 1}</span>
          </div>

          <div className="w-auto">
            <DatePicker
              date={entry.date}
              onDateChange={(date) => updateDate(entry.id, date)}
              className="w-[200px]"
            />
          </div>

          <div className="w-auto">
            <TimePicker
              value={entry.time}
              onChange={(time) => updateTime(entry.id, time)}
              className="w-[150px]"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeEntry(entry.id)}
            className="text-red-500 hover:bg-red-50 hover:text-red-700"
            disabled={entries.length === 1}
          >
            <CircleX className="h-4 w-4" />
            <span className="sr-only">삭제</span>
          </Button>
        </div>
      ))}

      <div className="flex w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={addEntry}
          className="mx-auto"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
