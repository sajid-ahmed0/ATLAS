import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isVisible && type !== 'loading') {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md font-sans max-w-sm"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 
              type === 'success' ? '#10b981' : 
              type === 'error' ? '#ef4444' : 
              type === 'loading' ? '#64748b' : '#3b82f6',
          }}
        >
          {type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
          {type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          {type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
          {type === 'loading' && <Loader2 className="w-5 h-5 text-slate-400 animate-spin shrink-0" />}
          
          <span className="text-sm font-medium text-slate-100">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
