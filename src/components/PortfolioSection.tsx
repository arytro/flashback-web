import React, { useState, useEffect } from 'react';
import { getPortfolioList } from '../data/availability';
import { PortfolioCategory, PortfolioItem } from '../types';
import { Lightbox } from './Lightbox';
import { Maximize2 } from 'lucide-react';

export const PortfolioSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>('todos');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(getPortfolioList());
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setPortfolioItems(getPortfolioList());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const categories: { key: PortfolioCategory; label: string }[] = [
    { key: 'todos', label: 'Todo' },
    { key: 'retratos', label: 'Retratos' },
    { key: 'sesiones', label: 'Sesiones' },
    { key: 'exterior', label: 'Exterior' },
    { key: 'editorial', label: 'Editorial' },
  ];

  const filteredItems =
    activeCategory === 'todos'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  const openLightbox = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsLightboxOpen(true);
  };

  return (
    <section
      id="portafolio"
      className="relative w-full bg-black text-white py-24 md:py-32 px-6 md:px-12 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-zinc-400 font-sans-clean font-semibold block mb-3">
              Selección Visual
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none font-medium">
              Portafolio
            </h2>
          </div>

          <div className="mt-6 md:mt-0 text-left md:text-right max-w-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-sans-clean font-light leading-relaxed">
              Luz, textura y contraste. Cada fotografía busca revelar la verdad del instante.
            </p>
          </div>
        </div>

        {/* Category Filters (Administrable) */}
        <div className="flex flex-wrap items-center justify-start md:justify-center gap-2 sm:gap-3 mb-14">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2 text-xs uppercase tracking-[0.22em] font-sans-clean transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-lg'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* High-Impact Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openLightbox(item)}
              className="group relative cursor-pointer overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/50 transition-all duration-500"
            >
              {/* Image Frame */}
              <div
                className={`relative overflow-hidden ${
                  item.aspectRatio === 'tall'
                    ? 'aspect-[3/4]'
                    : item.aspectRatio === 'wide'
                    ? 'aspect-[16/10]'
                    : 'aspect-square'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover object-center filter grayscale contrast-115 group-hover:contrast-125 group-hover:scale-105 transition-all duration-700 ease-out"
                  loading="lazy"
                />

                {/* Monochromatic Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-[10px] uppercase tracking-[0.25em] text-zinc-300 border border-white/10 font-sans-clean font-medium">
                    {item.categoryLabel}
                  </span>
                </div>

                {/* Hover Maximize Icon */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-black/80 text-white border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Bottom Caption */}
                <div className="absolute bottom-0 inset-x-0 p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-editorial text-2xl text-white tracking-wide mb-1">
                    {item.title}
                  </h3>
                  {item.quote && (
                    <p className="font-editorial italic text-xs text-zinc-300 line-clamp-1">
                      “{item.quote}”
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo photos disclaimer note as requested */}
        <div className="mt-12 text-center">
          <p className="text-[11px] text-zinc-500 font-sans-clean uppercase tracking-[0.2em]">
            Fotografías de muestra preparadas para ser sustituidas por el portafolio real de Flashback.
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        item={selectedItem}
        items={filteredItems}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelect={(item) => setSelectedItem(item)}
      />
    </section>
  );
};
