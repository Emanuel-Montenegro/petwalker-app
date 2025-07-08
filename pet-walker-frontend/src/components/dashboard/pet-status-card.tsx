import React from 'react';
import { cn } from '@/lib/utils';

interface PetStatusCardProps {
  name: string;
  status: string;
  emoji: string;
  isLoading?: boolean;
}

// simple shimmer placeholder
const Shimmer: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-16" />
  </div>
);

export const PetStatusCard: React.FC<PetStatusCardProps> = ({ name, status, emoji, isLoading }) => {
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-2xl shadow-sm bg-white border border-gray-100',
      'transition hover:shadow-md'
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
        {emoji}
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0">
        {isLoading ? (
          <Shimmer />
        ) : (
          <>
            <span className="font-semibold text-gray-800 truncate">{name}</span>
            <span className="text-sm text-gray-500 truncate">{status}</span>
          </>
        )}
      </div>
    </div>
  );
}; 