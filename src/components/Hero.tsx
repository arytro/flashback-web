import React, { useState, useEffect } from 'react';
import { ArrowDown, Instagram } from 'lucide-react';
import { HERO_IMAGES } from '../data/flashbackData';
import { getFlashbackConfig } from '../data/availability';
import { FlashbackConfig } from '../types';

export const Hero: React.FC = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getFlashbackConfig());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  // Subtle cinematic transition between high contrast photos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background High-Contrast Monochrome Slideshow */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((img, index) => (
          <div
            key={img.url}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeImageIndex ? 'opacity-90' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={img.url}
              alt={img.caption}
              className="w-full h-full object-cover object-center filter grayscale contrast-115 brightness-90 transform scale-100 transition-transform duration-[8000ms] ease-out motion-safe:scale-105"
            />
          </div>
        ))}

        {/* Monochromatic Cinematic Vignette Overlays (Pure Black gradients) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-28 sm:pb-36 flex flex-col items-center">
        {/* Subtle Instagram handle badge */}
        <a
          href={config.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 border border-white/20 bg-black/70 backdrop-blur-md px-4 py-1.5 mb-6 hover:border-white/50 transition-all group"
        >
          <Instagram className="w-3.5 h-3.5 text-white/80 group-hover:text-white" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-300 group-hover:text-white font-sans-clean font-medium">
            {config.instagramHandle}
          </span>
        </a>

        {/* Brand Headline */}
        <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.25em] uppercase text-white mb-6 select-none drop-shadow-2xl leading-none font-medium">
          {config.heroHeadline}
        </h1>

        {/* Poetic Short Photography Statement (No wedding references) */}
        <div className="max-w-2xl mx-auto mb-10 sm:mb-12 space-y-4">
          <p className="font-editorial italic text-2xl sm:text-3xl md:text-4xl text-zinc-200 font-light tracking-wide leading-snug">
            “{config.heroSubheadline}”
          </p>
          <div className="w-12 h-[1px] bg-white/40 mx-auto" />
          <p className="font-sans-clean text-xs sm:text-sm uppercase tracking-[0.25em] text-zinc-400 font-light max-w-lg mx-auto leading-relaxed">
            {config.heroTagline}
          </p>
        </div>

        {/* Hero CTAs: "Ver portafolio" & "Consultar disponibilidad" */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md mx-auto">
          <a
            href="#portafolio"
            id="hero-portfolio-cta"
            className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-[0.22em] font-sans-clean font-bold bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-xl text-center"
          >
            Ver portafolio
          </a>
          <a
            href="#disponibilidad"
            id="hero-availability-cta"
            className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-[0.22em] font-sans-clean font-medium border border-white/40 text-white hover:border-white hover:bg-white/10 bg-black/40 backdrop-blur-sm transition-all duration-300 text-center"
          >
            Consultar disponibilidad
          </a>
        </div>
      </div>

      {/* Bottom Slider Dots & Scroll Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center justify-center space-y-3 pointer-events-none">
        <div className="flex space-x-2 pointer-events-auto">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Ver imagen ${idx + 1}`}
              onClick={() => setActiveImageIndex(idx)}
              className={`h-[2px] transition-all duration-500 ${
                idx === activeImageIndex ? 'w-8 bg-white' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
            />
          ))}
        </div>
        <a
          href="#portafolio"
          aria-label="Desplazar hacia abajo"
          className="pointer-events-auto flex flex-col items-center text-zinc-400 hover:text-white transition-colors group pt-1"
        >
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-white/70" />
        </a>
      </div>
    </section>
  );
};
