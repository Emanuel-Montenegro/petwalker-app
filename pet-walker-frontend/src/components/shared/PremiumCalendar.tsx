"use client";
import { addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from 'date-fns';
import React, { useState } from 'react';

interface Props {
  selectedDate?: Date;
  onDateSelect: (d: Date) => void;
}

export const PremiumCalendar: React.FC<Props> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, i) => addDays(startDate, i));

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 w-80 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => setCurrentMonth(addWeeks(currentMonth, -4))} className="p-2 hover:bg-blue-50 rounded-lg" aria-label="Mes anterior">←</button>
        <h3 className="text-lg font-bold text-gray-800">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
        <button type="button" onClick={() => setCurrentMonth(addWeeks(currentMonth, 4))} className="p-2 hover:bg-blue-50 rounded-lg" aria-label="Mes siguiente">→</button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-semibold text-gray-500">
        {dayNames.map(d => <div key={d} className="text-center py-2">{d}</div>)}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const inMonth = day.getMonth() === currentMonth.getMonth();
          const isSel = selectedDate && isSameDay(day, selectedDate);
          const isTod = isToday(day);
          const past = isBefore(day, today);
          const disabled = !inMonth || past;

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onDateSelect(day)}
              className={`p-2 text-sm rounded-lg transition-all relative ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-blue-50'} ${isSel ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : ''} ${isTod && !isSel ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`}
            >
              {day.getDate()}
              {isTod && !isSel && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 