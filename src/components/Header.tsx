import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Instagram } from 'lucide-react';
import { getFlashbackConfig } from '../data/availability';
import { FlashbackConfig } from '../types';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleUpdate = () => setConfig(getFlashbackConfig());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const navLinks = [
    { label: 'Portafolio', href: '#portafolio' },
    { label: 'Sesiones', href: '#sesiones' },
    { label: 'Sobre Flashback', href: '#sobre-flashback' },
    { label: 'Disponibilidad', href: '#disponibilidad' },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md border-b border-white/10 py-3.5 shadow-2xl'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo & Instagram Tag */}
        <a href="#hero" className="group flex items-center space-x-3 focus:outline-none">
          {config.logoUrl && (
            <img
              src={config.logoUrl}
              alt={config.name}
              className="h-9 w-9 md:h-11 md:w-11 object-contain shrink-0"
            />
          )}
          <span className="flex flex-col">
            <span className="font-editorial text-2xl md:text-3xl tracking-[0.3em] font-medium text-white group-hover:text-zinc-300 transition-colors uppercase">
              {config.name}
            </span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 font-sans-clean font-light -mt-0.5">
              {config.instagramHandle}
            </span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-9 text-xs uppercase tracking-[0.25em] text-zinc-300 font-sans-clean">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300 font-light"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons: Instagram & Availability */}
        <div className="hidden sm:flex items-center space-x-4">
          <a
            href={config.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/20"
            aria-label="Instagram de Flashback"
            title="Instagram @flashback.dos"
          >
            <Instagram className="w-4 h-4" />
          </a>

          <a
            href="#disponibilidad"
            id="nav-cta-button"
            className="px-5 py-2.5 text-xs uppercase tracking-[0.22em] font-sans-clean font-medium text-black bg-white hover:bg-zinc-200 transition-all rounded-none shadow-sm flex items-center space-x-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Disponibilidad</span>
          </a>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          id="mobile-menu-toggle"
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-white hover:text-zinc-300 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="lg:hidden fixed inset-x-0 top-[62px] bg-black border-b border-white/10 px-6 py-8 shadow-2xl transition-all"
        >
          <div className="flex flex-col space-y-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-editorial text-2xl tracking-[0.2em] text-white hover:text-zinc-400 transition-colors uppercase"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <a
                href="#disponibilidad"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3.5 text-xs uppercase tracking-[0.22em] bg-white text-black font-semibold"
              >
                Consultar Disponibilidad
              </a>
              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 text-xs uppercase tracking-[0.22em] text-zinc-300 border border-white/20 hover:border-white"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram {config.instagramHandle}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
