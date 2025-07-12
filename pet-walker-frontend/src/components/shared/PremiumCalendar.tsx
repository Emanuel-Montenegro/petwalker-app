"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PremiumCalendarProps {
  value: string;
  onChange: (date: string) => void;
}

export function PremiumCalendar({ value, onChange }: PremiumCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedDate = value ? new Date(value) : null;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = newDate.toISOString().split('T')[0];
    onChange(dateString);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          type="button"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty days */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10" />
        ))}
        
        {/* Days */}
        {days.map((day) => {
          const past = isPastDate(day);
          const today = isToday(day);
          const selected = isSelected(day);
          
          return (
            <button
              key={day}
              onClick={() => !past && handleDateClick(day)}
              disabled={past}
              type="button"
              className={`
                h-10 rounded-lg font-medium text-sm transition-all duration-200
                ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                ${today && !selected ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-200' : ''}
                ${selected ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white transform scale-110 shadow-md' : ''}
                ${!past && !today && !selected ? 'text-gray-700' : ''}
              `}
            >
              {day}
              {today && (
                <div className="w-1 h-1 bg-current rounded-full mx-auto mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-100 rounded ring-2 ring-blue-200" />
          <span className="text-gray-600">Hoy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
          <span className="text-gray-600">Seleccionado</span>
        </div>
      </div>
    </div>
  );
} 