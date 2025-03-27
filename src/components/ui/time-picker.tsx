"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  disabled?: boolean;
}

export default function TimePicker({
  value,
  onChange,
  disabled,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState(() => {
    return value ? parseInt(value.split(":")[0]) : 19;
  });

  const handleHourSelect = (hour: number) => {
    const timeString = `${hour.toString().padStart(2, "0")}:00`;
    setSelectedHour(hour);
    onChange?.(timeString);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || "시간 선택"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <div className="h-64 overflow-y-auto">
          {HOURS.map((hour) => (
            <Button
              key={hour}
              variant="ghost"
              className={cn(
                "w-full justify-start rounded-none",
                selectedHour === hour && "bg-accent",
              )}
              onClick={() => handleHourSelect(hour)}
            >
              {hour.toString().padStart(2, "0")}:00
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
