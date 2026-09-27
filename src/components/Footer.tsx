import React, { useState, useEffect } from 'react';
import { getFlashbackConfig } from '../data/availability';
import { FlashbackConfig } from '../types';
import { ArrowUp, Instagram, Lock } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getFlashbackConfig());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-black text-zinc-400 border-t border-white/10 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 border-b border-white/10 gap-8">
          <div>
            <span className="font-editorial text-3xl tracking-[0.3em] text-white uppercase block mb-1 font-medium">
              {config.name}
            </span>
            <div className="flex items-center space-x-3 text-xs uppercase tracking-[0.2em] font-sans-clean">
              <span className="text-zinc-300">{config.tagline}</span>
              <span className="text-zinc-600">·</span>
              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-zinc-300 flex items-center space-x-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{config.instagramHandle}</span>
              </a>
            </div>
            <p className="text-xs text-zinc-500 font-light mt-2 max-w-sm">
              {config.location}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xs uppercase tracking-[0.2em] font-sans-clean">
            <a href="#portafolio" className="hover:text-white transition-colors">Portafolio</a>
            <a href="#sesiones" className="hover:text-white transition-colors">Sesiones</a>
            <a href="#sobre-flashback" className="hover:text-white transition-colors">Sobre Flashback</a>
            <a href="#disponibilidad" className="hover:text-white transition-colors">Disponibilidad</a>
            <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
            <button
              onClick={scrollToTop}
              className="p-2 border border-white/15 text-white hover:border-white transition-colors"
              title="Subir al inicio"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Credits, Tag & Discreet Admin Link as requested */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 text-[11px] text-zinc-500 font-sans-clean font-light">
          <div className="flex items-center space-x-3">
            <p>© {new Date().getFullYear()} FLASHBACK. Todos los derechos reservados.</p>
            <span>·</span>
            {/* Small discreet link to /admin as explicitly requested */}
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                navigate('/admin');
              }}
              className="text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-wider text-[10px] inline-flex items-center space-x-1"
              title="Acceso al Panel Administrativo"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Admin</span>
            </a>
          </div>

          <div className="inline-flex items-center space-x-2 border border-white/10 bg-zinc-950 px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="uppercase tracking-[0.2em] text-zinc-400">Sitio Oficial · {config.instagramHandle}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
