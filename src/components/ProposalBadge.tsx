import React, { useState } from 'react';
import { QrCode, X, Check, Instagram, Database } from 'lucide-react';
import { getFlashbackConfig } from '../data/availability';
import { useNavigation } from '../context/NavigationContext';

export const ProposalBadge: React.FC = () => {
  const { navigate } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const config = getFlashbackConfig();

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-zinc-950/90 hover:bg-black text-white border border-white/20 px-3.5 py-2 backdrop-blur-md shadow-2xl transition-all duration-300 text-[11px] uppercase tracking-[0.2em] font-sans-clean font-medium"
        >
          <QrCode className="w-3.5 h-3.5 text-white" />
          <span>Info QR &amp; Admin</span>
        </button>
      ) : (
        <div className="bg-zinc-950 border border-white/20 text-white p-5 max-w-sm backdrop-blur-xl shadow-2xl animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center space-x-2 text-white">
              <Database className="w-4 h-4 text-white" />
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold font-sans-clean">
                FLASHBACK · Web Oficial
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs text-zinc-300 font-light leading-relaxed font-sans-clean">
            <p className="font-editorial text-lg text-white">
              Página pública oficial de <strong className="text-white">FLASHBACK</strong>
            </p>
            <p className="text-zinc-400">
              Diseñada con estética monocromática editorial para visualización desde tarjetas físicas QR y perfil de Instagram.
            </p>

            <div className="bg-black p-3.5 border border-white/10 space-y-2 text-[11px] text-zinc-300">
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Instagram: <strong className="text-white">{config.instagramHandle}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Enfoque en retratos, exteriores y sesiones creativas</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Capa de datos lista para base de datos (Supabase / Firebase)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Calendario con bloqueo/liberación reactiva en vivo</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin');
                }}
                className="flex items-center justify-center space-x-2 w-full py-2.5 bg-white text-black text-[11px] uppercase tracking-[0.2em] font-bold text-center hover:bg-zinc-200 transition-colors shadow"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Abrir Panel Admin (/admin)</span>
              </button>

              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-2 text-zinc-400 hover:text-white text-[10px] uppercase tracking-[0.15em] font-medium text-center border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram {config.instagramHandle}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
