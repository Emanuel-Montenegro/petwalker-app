"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"

export function Calendar({ value, onChange, ...props }: { value: Date | undefined, onChange: (date: Date) => void, [key: string]: any }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  return (
    <div className="rounded-2xl shadow-2xl bg-white p-4 border border-gray-200">
      <DayPicker
        mode="single"
        selected={value}
        onSelect={(date) => {
          if (date && date >= today) {
            onChange(date);
          }
        }}
        disabled={(date) => date < today}
        showOutsideDays
        classNames={{
          months: "flex flex-col gap-4",
          month: "space-y-4",
          caption: "flex justify-between items-center mb-2 px-2",
          caption_label: "text-lg font-bold text-gray-800",
          nav: "flex gap-2",
          nav_button: "rounded-full p-2 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell: "w-10 h-10 text-center text-xs font-semibold text-gray-400",
          row: "flex w-full mt-1",
          cell: "w-10 h-10 text-center p-0 relative group",
          day: "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer outline-none",
          day_selected: "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500",
          day_today: "border border-green-400 text-green-700 font-bold",
          day_outside: "text-gray-300",
          day_disabled: "text-gray-300 cursor-not-allowed opacity-50",
        }}
        {...props}
      />
    </div>
  );
}
