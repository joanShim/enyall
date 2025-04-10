import * as React from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // 기본값 설정
  const defaultHour = "6"; // 기본값 6시
  const defaultMinute = "00"; // 기본값 00분
  const defaultPeriod = "PM"; // 기본값 오후

  // 현재 선택된 시간 파싱
  const parseTime = (
    timeString: string | undefined,
  ): [string, string, string] => {
    if (!timeString) return [defaultHour, defaultMinute, defaultPeriod];

    const [hourStr, minute] = timeString.split(":");
    const hour = Number.parseInt(hourStr, 10);

    if (hour === 0) return ["12", minute, "AM"];
    if (hour === 12) return ["12", minute, "PM"];
    if (hour > 12) return [(hour - 12).toString(), minute, "PM"];
    return [hour.toString(), minute, "AM"];
  };

  const [selectedHour, selectedMinute, selectedPeriod] = parseTime(value);

  // 시간 증가 (12 -> 1 순환)
  const incrementHour = () => {
    const currentHour = Number.parseInt(selectedHour, 10);
    const newHour = currentHour === 12 ? 1 : currentHour + 1;
    updateTimeValue(newHour.toString(), selectedMinute, selectedPeriod);
  };

  // 시간 감소 (1 -> 12 순환)
  const decrementHour = () => {
    const currentHour = Number.parseInt(selectedHour, 10);
    const newHour = currentHour === 1 ? 12 : currentHour - 1;
    updateTimeValue(newHour.toString(), selectedMinute, selectedPeriod);
  };

  // 분 토글 (00 <-> 30)
  const toggleMinute = () => {
    const newMinute = selectedMinute === "00" ? "30" : "00";
    updateTimeValue(selectedHour, newMinute, selectedPeriod);
  };

  // 오전/오후 토글
  const togglePeriod = () => {
    const newPeriod = selectedPeriod === "AM" ? "PM" : "AM";
    updateTimeValue(selectedHour, selectedMinute, newPeriod);
  };

  // 24시간 형식으로 변환
  const convertTo24Hour = (hour: string, period: string): string => {
    const hourNum = Number.parseInt(hour, 10);

    if (period === "AM") {
      return hourNum === 12 ? "00" : hour.padStart(2, "0");
    } else {
      return hourNum === 12 ? "12" : (hourNum + 12).toString().padStart(2, "0");
    }
  };

  // 시간 값 업데이트
  const updateTimeValue = (hour: string, minute: string, period: string) => {
    const hour24 = convertTo24Hour(hour, period);
    onChange(`${hour24}:${minute}`);
  };

  // 표시용 시간 포맷
  const formatTimeForDisplay = (timeString: string | undefined): string => {
    if (!timeString) {
      return `${defaultHour}:${defaultMinute} ${defaultPeriod}`;
    }

    const [hour, minute, period] = parseTime(timeString);
    return `${hour}:${minute} ${period}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatTimeForDisplay(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="start">
        <div className="grid grid-cols-3 gap-4">
          {/* 오전/오후 선택 */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm font-medium">AM/PM</div>
            <Button
              variant="outline"
              className={cn("h-10 px-4 font-medium")}
              onClick={togglePeriod}
            >
              {selectedPeriod}
            </Button>
          </div>

          {/* 시간 선택 */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm font-medium">시</div>
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={incrementHour}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="flex h-10 items-center justify-center text-lg font-medium">
                {selectedHour}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={decrementHour}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 분 선택 */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm font-medium">분</div>
            <Button
              variant="outline"
              className="h-10 px-4 font-medium"
              onClick={toggleMinute}
            >
              {selectedMinute}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
