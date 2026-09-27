import React, { useState, useEffect } from 'react';
import { getSessionsList } from '../data/availability';
import { SessionDetail } from '../types';
import { Calendar, ArrowRight, Clock, Check } from 'lucide-react';

interface SessionsSectionProps {
  onSelectSession?: (sessionTitle: string) => void;
}

export const SessionsSection: React.FC<SessionsSectionProps> = ({ onSelectSession }) => {
  const [sessions, setSessions] = useState<SessionDetail[]>(getSessionsList());

  useEffect(() => {
    const handleUpdate = () => setSessions(getSessionsList());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const handleConsultSession = (session: SessionDetail) => {
    if (onSelectSession) {
      onSelectSession(session.title);
    }
    const calendarEl = document.getElementById('disponibilidad');
    if (calendarEl) {
      calendarEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="sesiones"
      className="relative w-full bg-[#0a0a0c] text-white py-24 md:py-32 px-6 md:px-12 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-zinc-400 font-sans-clean font-semibold block mb-3">
              Propuestas Visuales
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none font-medium">
              Sesiones
            </h2>
          </div>

          <div className="mt-6 md:mt-0 max-w-md">
            <p className="font-sans-clean text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Cada sesión se concibe de forma individualizada, buscando captar la esencia de la persona y la fuerza visual del entorno.
            </p>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group flex flex-col justify-between bg-zinc-950 border border-white/10 hover:border-white/40 transition-all duration-500 overflow-hidden shadow-2xl"
            >
              {/* Photo Header */}
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src={session.imageUrl}
                  alt={session.title}
                  className="w-full h-full object-cover object-center filter grayscale contrast-115 group-hover:scale-105 group-hover:contrast-125 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                {/* Duration badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-sans-clean font-medium">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>{session.duration}</span>
                  </span>
                </div>

                {/* Price or "Consultar" badge */}
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1 bg-black/90 backdrop-blur-md text-[11px] text-white font-sans-clean font-medium tracking-wider border border-white/10">
                    {session.priceNote || 'Consultar'}
                  </span>
                </div>
              </div>

              {/* Information Body */}
              <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between space-y-6">
                <div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-white group-hover:text-zinc-300 transition-colors mb-2 leading-snug">
                    {session.title}
                  </h3>
                  <p className="font-sans-clean text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mb-6">
                    {session.fullDesc}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2.5 pt-4 border-t border-white/10">
                    {session.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 text-xs text-zinc-300 font-light">
                        <Check className="w-3.5 h-3.5 text-white mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consult Button */}
                <div className="pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleConsultSession(session)}
                    className="w-full py-3.5 px-5 bg-zinc-900 group-hover:bg-white text-white group-hover:text-black border border-white/10 group-hover:border-white text-xs uppercase tracking-[0.22em] font-sans-clean font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Consultar disponibilidad</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
