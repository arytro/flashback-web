import React, { useState, useEffect } from 'react';
import { getFlashbackConfig } from '../data/availability';
import { FlashbackConfig } from '../types';
import { Eye, Film, Sparkles, Sliders } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getFlashbackConfig());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const pillars = [
    {
      icon: Eye,
      title: 'Mirada Atenta',
      desc: 'Privilegiamos la naturalidad del gesto sobre los posados impuestos. Menos artificio, más verdad.',
    },
    {
      icon: Film,
      title: 'Estética Cinematográfica',
      desc: 'Composición de cuadro y manejo de la luz pensados con lenguaje visual contemporáneo.',
    },
    {
      icon: Sliders,
      title: 'Contraste & Edición Editorial',
      desc: 'Tratamiento tonal meticuloso que exalta texturas, sombras y volúmenes con carácter.',
    },
    {
      icon: Sparkles,
      title: 'Espacio Colaborativo',
      desc: 'Construimos cada sesión en conjunto para que te sientas con total libertad y comodidad.',
    },
  ];

  return (
    <section
      id="sobre-flashback"
      className="relative w-full bg-black text-white py-24 md:py-32 px-6 md:px-12 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Column: High Contrast Monochromatic Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative border border-white/10 p-3 bg-zinc-950">
              <div className="overflow-hidden aspect-[4/5] relative">
                <img
                  src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1000&q=85"
                  alt="FLASHBACK - Fotografía y Dirección Visual"
                  className="w-full h-full object-cover object-center filter grayscale contrast-125"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/90 backdrop-blur-md border border-white/15">
                <p className="font-editorial italic text-base text-zinc-200 leading-snug">
                  “Una fotografía es un destello de memoria preservado en el tiempo.”
                </p>
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-sans-clean block mt-2">
                  FLASHBACK · {config.instagramHandle}
                </span>
              </div>
            </div>
          </div>

          {/* Text Presentation Column */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-[0.35em] text-zinc-400 font-sans-clean font-semibold block mb-3">
                Sobre Flashback
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-5 font-medium">
                La fotografía como búsqueda de la emoción y el contraste visual
              </h2>
              
              <div className="space-y-4 font-sans-clean text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                {config.aboutText.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {/* Visual Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/10">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div key={idx} className="space-y-2 p-4 bg-zinc-950 border border-white/10">
                    <div className="flex items-center space-x-2 text-white">
                      <IconComponent className="w-4 h-4 text-zinc-300" />
                      <h3 className="font-sans-clean text-xs uppercase tracking-[0.18em] font-medium text-white">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed font-sans-clean">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
