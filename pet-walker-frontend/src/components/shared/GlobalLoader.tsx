import React, { memo } from 'react';

const GlobalLoader = memo(function GlobalLoader() {
  return (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
      {/* Spinner optimizado */}
      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-primary dark:border-blue-500 mb-4 sm:mb-6"></div>
      
      {/* Skeleton loader mobile-first */}
      <div className="w-48 sm:w-64 h-5 sm:h-6 bg-gray-200/60 dark:bg-gray-700/60 rounded mb-2 animate-pulse" />
      <div className="w-32 sm:w-48 h-3 sm:h-4 bg-gray-200/40 dark:bg-gray-700/40 rounded mb-2 animate-pulse" />
      <div className="w-56 sm:w-80 h-8 sm:h-10 bg-gray-200/30 dark:bg-gray-700/30 rounded animate-pulse" />
  </div>
);
});

export default GlobalLoader; 