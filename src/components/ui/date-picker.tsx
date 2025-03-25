"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 클라이언트 컴포넌트 래퍼
export function DatePicker(props: {
  date?: Date | null;
  onDateChange: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return <DatePickerInner {...props} />;
}

function DatePickerInner({
  date,
  onDateChange,
  disabled = false,
  placeholder = "날짜 선택",
}: {
  date?: Date | null;
  onDateChange: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(date) => onDateChange(date || null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
