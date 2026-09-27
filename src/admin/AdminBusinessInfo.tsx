import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  Instagram,
  MessageCircle,
  Mail,
  MapPin,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { getFlashbackConfig, saveFlashbackConfig } from '../data/availability';
import { FlashbackConfig } from '../types';

export const AdminBusinessInfo: React.FC = () => {
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(config.name);
  const [tagline, setTagline] = useState(config.tagline);
  const [instagramHandle, setInstagramHandle] = useState(config.instagramHandle);
  const [instagramUrl, setInstagramUrl] = useState(config.instagramUrl);
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappNumber);
  const [whatsappDisplay, setWhatsappDisplay] = useState(config.whatsappDisplay);
  const [tiktokUrl, setTiktokUrl] = useState(config.tiktokUrl || '');
  const [location, setLocation] = useState(config.location);
  const [heroHeadline, setHeroHeadline] = useState(config.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(config.heroSubheadline);
  const [heroTagline, setHeroTagline] = useState(config.heroTagline);
  const [aboutP1, setAboutP1] = useState(config.aboutText[0] || '');
  const [aboutP2, setAboutP2] = useState(config.aboutText[1] || '');

  useEffect(() => {
    const handleUpdate = () => {
      const fresh = getFlashbackConfig();
      setConfig(fresh);
    };
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = saveFlashbackConfig({
      name: name.trim(),
      tagline: tagline.trim(),
      instagramHandle: instagramHandle.trim(),
      instagramUrl: instagramUrl.trim(),
      whatsappNumber: whatsappNumber.replace(/\D/g, ''),
      whatsappDisplay: whatsappDisplay.trim(),
      tiktokUrl: tiktokUrl.trim(),
      location: location.trim(),
      heroHeadline: heroHeadline.trim(),
      heroSubheadline: heroSubheadline.trim(),
      heroTagline: heroTagline.trim(),
      aboutText: [aboutP1.trim(), aboutP2.trim()].filter(Boolean),
    });

    setConfig(updated);
    showToast('¡Información del negocio actualizada y sincronizada con la web pública!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-emerald-500/50 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 text-xs animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Información del Estudio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Modifica los datos de marca, contacto y biografía. Estos campos alimentan el header, footer, hero y botones de WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Brand Identity */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow space-y-6">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Building className="w-4 h-4 text-zinc-400" />
            <span>Identidad & Nombre de Marca</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Nombre del Estudio *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Subtítulo / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>
        </div>
        </div>

        {/* Social & WhatsApp Channels */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow space-y-6">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Instagram className="w-4 h-4 text-zinc-400" />
            <span>Canales Directos (WhatsApp, Instagram & TikTok)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Usuario de Instagram (@) *
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                URL de Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
              URL de TikTok
            </label>
            <input
              type="url"
              placeholder="https://www.tiktok.com/@usuario"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Número de WhatsApp para Enlaces (Dígitos y código país)
              </label>
              <input
                type="text"
                placeholder="18090000000"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg font-mono focus:outline-none focus:border-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Utilizado para construir los enlaces directos wa.me
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Número de WhatsApp Visible (Formato amigable)
              </label>
              <input
                type="text"
                placeholder="+1 (809) 000-0000"
                value={whatsappDisplay}
                onChange={(e) => setWhatsappDisplay(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>
          </div>
        </div>

        {/* Hero & About Statements */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow space-y-6">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span>Textos de Portada & Biografía</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Frase Corta del Hero (entrecomillada en portada)
              </label>
              <input
                type="text"
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Lema o Descripción Corta del Hero
              </label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Sobre Flashback — Párrafo 1
              </label>
              <textarea
                rows={3}
                value={aboutP1}
                onChange={(e) => setAboutP1(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                Sobre Flashback — Párrafo 2
              </label>
              <textarea
                rows={3}
                value={aboutP2}
                onChange={(e) => setAboutP2(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Toda la Información</span>
          </button>
        </div>
      </form>
    </div>
  );
};
