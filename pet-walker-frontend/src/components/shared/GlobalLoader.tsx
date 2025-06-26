import React from 'react';

const GlobalLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mb-6"></div>
    <div className="w-64 h-6 bg-gray-200/60 rounded mb-2 animate-pulse" />
    <div className="w-48 h-4 bg-gray-200/40 rounded mb-2 animate-pulse" />
    <div className="w-80 h-10 bg-gray-200/30 rounded animate-pulse" />
  </div>
);

export default GlobalLoader; 