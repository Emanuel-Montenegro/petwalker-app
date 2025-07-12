'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <div className="flex justify-end">
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}; 