import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface LightboxProps {
  imageUrls: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({
  imageUrls,
  initialIndex = 0,
  isOpen,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync index when the lightbox opens at a new position
  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < imageUrls.length - 1;

  const prev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);

  const next = useCallback(() => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  }, [hasNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const portal = createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="lightbox.dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose}
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Close button */}
          <button
            type="button"
            data-ocid="lightbox.close_button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "absolute top-4 right-4 z-10 p-2 rounded-full",
              "bg-white/10 hover:bg-white/20 text-white transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
            )}
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          {imageUrls.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-body">
              {currentIndex + 1} / {imageUrls.length}
            </div>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrls[currentIndex]}
              alt={`Attachment ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl"
              draggable={false}
            />
          </motion.div>

          {/* Prev arrow */}
          {hasPrev && (
            <button
              type="button"
              data-ocid="lightbox.pagination_prev"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full",
                "bg-white/10 hover:bg-white/20 text-white transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next arrow */}
          {hasNext && (
            <button
              type="button"
              data-ocid="lightbox.pagination_next"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full",
                "bg-white/10 hover:bg-white/20 text-white transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return portal;
}
