'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon } from "@radix-ui/react-icons"; // Ícono de celebración similar

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  title,
  message,
}: ConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 text-center">
        <DialogHeader className="flex flex-col items-center gap-4">
          <CheckCircledIcon className="h-16 w-16 text-green-500" />
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-center">
          <Button onClick={onClose} className="w-full max-w-xs bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 