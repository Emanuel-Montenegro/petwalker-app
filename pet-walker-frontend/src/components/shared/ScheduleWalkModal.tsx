import { useIsMobile } from '@/lib/utils';
import { ScheduleWalkForm } from './ScheduleWalkForm';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleWalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  mascota: any;
}

export function ScheduleWalkModal({ isOpen, onClose, mascota }: ScheduleWalkModalProps) {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            {/* Bottom Sheet */}
            <motion.div
              className="fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Pill Handle */}
              <div className="w-full flex justify-center pt-2 pb-4">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    🚶‍♂️
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Agendar Paseo</h2>
                  <p className="text-gray-600 dark:text-gray-400">Para {mascota.nombre}</p>
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
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
              {/* Barra decorativa superior */}
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl" />

              {/* Header */}
              <div className="p-6 pb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    🚶‍♂️
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Agendar Paseo</h2>
                  <p className="text-gray-600 dark:text-gray-400">Para {mascota.nombre}</p>
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
        </>
      )}
    </AnimatePresence>
  );
} 