/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="w-5 h-5 text-sky-500" />;

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-50 border-rose-200 text-rose-900';
            icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
          }

          return (
            <ToastItem
              key={toast.id}
              toast={toast}
              bgColor={bgColor}
              icon={icon}
              onClose={onClose}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  bgColor: string;
  icon: React.ReactNode;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, bgColor, icon, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000); // Auto close after 5s

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor} backdrop-blur-md`}
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 text-sm font-medium pr-1">{toast.message}</div>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
