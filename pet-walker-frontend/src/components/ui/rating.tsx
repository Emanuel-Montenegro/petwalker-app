"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  readonly = false,
  size = 'md',
  onChange,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (starValue: number) => {
    if (!readonly && onChange) {
      onChange(starValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, starValue: number) => {
    if (!readonly && onChange && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onChange(starValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;
        const isHalfFilled = starValue - 0.5 === value;

        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => handleStarClick(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            className={cn(
              sizeClasses[size],
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm transition-all duration-200",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            aria-label={`${starValue} ${starValue === 1 ? 'estrella' : 'estrellas'}`}
            tabIndex={readonly ? -1 : 0}
          >
            <svg
              className={cn(
                "w-full h-full transition-colors duration-200",
                isFilled || isHalfFilled
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 fill-current hover:text-yellow-300"
              )}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          ({value.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default Rating; 