"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateInputProps {
  label?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
}

export default function DateInput({
  placeholder = "YYYY-MM-DD",
  value,
  onChange,
  className,
}: DateInputProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [inputValue, setInputValue] = useState<string>(
    value ? format(value, "yyyy-MM-dd") : "",
  );
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setDate(value);
      setInputValue(format(value, "yyyy-MM-dd"));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);

    // 입력 형식이 YYYY-MM-DD인 경우에만 날짜 객체로 변환
    if (/^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
      try {
        const parsedDate = parse(newValue, "yyyy-MM-dd", new Date());
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
          onChange?.(parsedDate);
        } else {
          throw new Error("유효하지 않은 날짜입니다");
        }
      } catch (error) {
        setDate(undefined);
        onChange?.(undefined);
        if (error instanceof Error) {
          console.error("날짜 파싱 오류:", error.message);
        }
        setError("올바른 날짜 형식이 아닙니다.");
      }
    } else {
      setDate(undefined);
      onChange?.(undefined);
      if (newValue && newValue.length > 0) {
        setError("YYYY-MM-DD 형식으로 입력해주세요.");
      }
    }
  };

  const handleCalendarSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setInputValue(format(newDate, "yyyy-MM-dd"));
      onChange?.(newDate);
    } else {
      setInputValue("");
      onChange?.(undefined);
    }
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex">
        <Input
          id="date-input"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={cn("w-full", error && "border-red-500")}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="-ml-1 shrink-0"
              aria-label="캘린더에서 날짜 선택"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              locale={ko}
              weekStartsOn={0} // 일요일부터 시작
              className="rounded-md"
              classNames={{
                day_selected: "bg-primary text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground"></p>
      )}
    </div>
  );
}
