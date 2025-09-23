import { useIsMobile } from '@/lib/utils';
import { ScheduleWalkForm } from './ScheduleWalkForm';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface ScheduleWalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  mascota: any;
}

export function ScheduleWalkModal({ isOpen, onClose, mascota }: ScheduleWalkModalProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay con z-index más alto */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {isMobile ? (
            // Bottom Sheet para móvil
            <motion.div
              className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-3xl max-h-[90vh] overflow-y-auto"
              style={{ zIndex: 9999 }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Handle para arrastrar */}
              <div className="w-full flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    🚶‍♂️
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Agendar Paseo</h2>
                  <p className="text-gray-600 dark:text-gray-400">Para {mascota?.nombre}</p>
                </div>
              </div>

              {/* Form */}
              <div className="px-6 pb-6">
                <ScheduleWalkForm
                  mascota={mascota}
                  onSuccess={onClose}
                  onCancel={onClose}
                />
              </div>
            </motion.div>
          ) : (
            // Modal centrado para desktop
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 9999 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                {/* Barra decorativa superior */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl" />

                {/* Botón cerrar */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                >
                  <span className="text-gray-500 dark:text-gray-400 text-lg">×</span>
                </button>

                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                      🚶‍♂️
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Agendar Paseo</h2>
                    <p className="text-gray-600 dark:text-gray-400">Para {mascota?.nombre}</p>
                  </div>
                </div>

                {/* Form */}
                <div className="px-6 pb-6">
                  <ScheduleWalkForm
                    mascota={mascota}
                    onSuccess={onClose}
                    onCancel={onClose}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );

  // Usar createPortal para renderizar en el body
  return createPortal(modalContent, document.body);
}