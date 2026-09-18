"use client";

interface DateRangePickerProps {
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangePicker({ onFromChange, onToChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        onChange={(e) => onFromChange(e.target.value)}
        className="p-2 border rounded"
      />
      <span>to</span>
      <input
        type="date"
        onChange={(e) => onToChange(e.target.value)}
        className="p-2 border rounded"
      />
    </div>
  );
}
