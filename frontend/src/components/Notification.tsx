// components/ui/notification.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationProps {
  type?: NotificationType;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Auto-close duration in milliseconds (0 for no auto-close)
}

export function Notification({
  type = "info",
  message,
  isOpen,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-800 dark:text-amber-200",
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-16 right-0 z-2000 w-full max-w-sm"
          >
          <div
            className={`rounded-lg shadow-lg border px-4 py-3 flex items-center justify-between ${currentStyle.bg} ${currentStyle.border}`}
          >
            <div className="flex items-center space-x-3">
              {currentStyle.icon}
              <span className={`text-sm font-medium ${currentStyle.text}`}>
                {message}
              </span>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent active:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
            >
              <X className="h-4 w-4 cursor-pointer" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
