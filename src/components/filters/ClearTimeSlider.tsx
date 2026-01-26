"use client";

import { Slider } from "@/components/ui/slider";
import { formatMinutesToHoursJP } from "@/lib/utils/date";

interface ClearTimeSliderProps {
  value: [number, number]; // [min, max] in minutes
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function ClearTimeSlider({
  value,
  onChange,
  min = 0,
  max = 6000, // 100時間
  step = 60, // 1時間単位
}: ClearTimeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">クリア時間</label>
        <span className="text-sm text-muted-foreground">
          {value[0] === min && value[1] === max
            ? "すべて"
            : `${formatMinutesToHoursJP(value[0])} 〜 ${formatMinutesToHoursJP(
                value[1]
              )}`}
        </span>
      </div>
      <Slider
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0時間</span>
        <span>〜10h</span>
        <span>〜30h</span>
        <span>〜60h</span>
        <span>100h+</span>
      </div>
    </div>
  );
}
