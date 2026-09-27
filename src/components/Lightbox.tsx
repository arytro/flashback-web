import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { PortfolioItem } from '../types';

interface LightboxProps {
  item: PortfolioItem | null;
  items: PortfolioItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: PortfolioItem) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  item,
  items,
  isOpen,
  onClose,
  onSelect,
}) => {
  const currentIndex = item ? items.findIndex((i) => i.id === item.id) : -1;

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < items.length - 1) {
      onSelect(items[currentIndex + 1]);
    } else if (currentIndex === items.length - 1) {
      onSelect(items[0]);
    }
  }, [currentIndex, items, onSelect]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelect(items[currentIndex - 1]);
    } else if (currentIndex === 0) {
      onSelect(items[items.length - 1]);
    }
  }, [currentIndex, items, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div
      id="portfolio-lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 md:p-10"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div
        className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xs uppercase tracking-[0.25em] font-sans-clean text-zinc-400">
            FLASHBACK · Portafolio
          </span>
          <span className="text-xs text-zinc-700">|</span>
          <span className="text-xs font-sans-clean text-zinc-400 tracking-widest">
            {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </div>

        <button
          type="button"
          aria-label="Cerrar vista completa"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev button */}
      <button
        type="button"
        aria-label="Fotografía anterior"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-zinc-900/90 border border-white/10 text-white hover:text-white hover:border-white transition-all focus:outline-none shadow-2xl"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Next button */}
      <button
        type="button"
        aria-label="Siguiente fotografía"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-zinc-900/90 border border-white/10 text-white hover:text-white hover:border-white transition-all focus:outline-none shadow-2xl"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Content wrapper */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main large image */}
        <div className="relative max-h-[70vh] overflow-hidden shadow-2xl bg-black border border-white/10">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-[70vh] w-auto max-w-full object-contain mx-auto"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Caption and detail info bar */}
        <div className="mt-4 w-full max-w-2xl text-center px-4">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.25em] text-zinc-300 bg-zinc-900 px-3 py-1 border border-white/10">
              <Tag className="w-3 h-3 mr-1.5" />
              {item.categoryLabel}
            </span>
            {item.location && (
              <span className="text-[11px] text-zinc-500 font-sans-clean">
                {item.location}
              </span>
            )}
          </div>

          <h3 className="font-editorial text-2xl md:text-3xl text-white tracking-wide">
            {item.title}
          </h3>

          {item.quote && (
            <p className="font-editorial italic text-sm text-zinc-300 mt-1 max-w-lg mx-auto">
              “{item.quote}”
            </p>
          )}

          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-3 font-sans-clean font-light">
            ← / → para navegar · ESC para cerrar
          </p>
        </div>
      </div>
    </div>
  );
};
