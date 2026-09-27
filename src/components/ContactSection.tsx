import React, { useState, useEffect } from 'react';
import { getFlashbackConfig, submitBookingRequest, buildFlashbackWhatsAppUrl, getSessionsList } from '../data/availability';
import { FlashbackConfig, SessionDetail } from '../types';
import { MessageCircle, Instagram, Mail, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());
  const [sessions, setSessions] = useState<SessionDetail[]>(getSessionsList());
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    sesion: 'Sesiones personales',
    fecha: '',
    hora: '10:00 AM',
    mensaje: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getFlashbackConfig());
      setSessions(getSessionsList());
    };
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Preserve Formspree if configured
    if (config.formspreeEndpoint) {
      try {
        await fetch(config.formspreeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (err) {
        console.error('Error sending to Formspree', err);
      }
    }

    await submitBookingRequest({
      clientName: formData.nombre,
      clientEmail: formData.email,
      clientPhone: formData.whatsapp,
      sessionType: formData.sesion,
      selectedDate: formData.fecha || 'Fecha por coordinar',
      selectedTime: formData.hora || '10:00 AM',
      message: formData.mensaje,
    });

    const wa = buildFlashbackWhatsAppUrl({
      session: formData.sesion,
      date: formData.fecha || 'fecha próxima',
      time: formData.hora,
      clientName: formData.nombre,
      customNote: formData.mensaje,
    });

    setLastWhatsAppUrl(wa);
    setSubmitted(true);
  };

  return (
    <section
      id="contacto"
      className="relative w-full bg-[#0a0a0c] text-white py-24 md:py-32 px-6 md:px-12 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.35em] text-zinc-400 font-sans-clean font-semibold block mb-3">
            Canales Directos
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none mb-4 font-medium">
            Contacto
          </h2>
          <p className="font-sans-clean text-xs sm:text-sm text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
            Hablemos sobre tu idea, sesión o proyecto visual. Puedes escribirnos directamente o completar el formulario.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Direct channels */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-sans-clean mb-4 font-semibold">
              Redes & Mensajería
            </h3>

            {/* Instagram @flashback.dos */}
            <a
              href={config.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 border border-white/10 bg-zinc-950 hover:border-white transition-all group block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-black border border-white/10 text-white">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.18em] text-white font-sans-clean block font-medium">
                      Instagram Oficial
                    </span>
                    <span className="text-xs text-zinc-400 font-mono block mt-0.5">
                      {config.instagramHandle}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={buildFlashbackWhatsAppUrl({})}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 border border-white/10 bg-zinc-950 hover:border-white transition-all group block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-black border border-white/10 text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.18em] text-white font-sans-clean block font-medium">
                      WhatsApp Directo
                    </span>
                    <span className="text-xs text-zinc-400 font-mono block mt-0.5">
                      {config.whatsappDisplay}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${config.email}`}
              className="p-5 border border-white/10 bg-zinc-950 hover:border-white transition-all group block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-black border border-white/10 text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.18em] text-white font-sans-clean block font-medium">
                      Correo Electrónico
                    </span>
                    <span className="text-xs text-zinc-400 font-mono block mt-0.5">
                      {config.email}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-zinc-950 border border-white/10 p-7 sm:p-10">
            <h3 className="font-editorial text-3xl text-white mb-2 font-medium">
              Escríbenos
            </h3>
            <p className="text-xs text-zinc-400 font-sans-clean mb-8 font-light">
              Cuéntanos sobre tu sesión para coordinar fechas y responder tus inquietudes.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-5 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
                <h4 className="font-editorial text-3xl text-white">
                  Solicitud Recibida
                </h4>
                <div className="p-4 bg-black border border-white/10 max-w-md mx-auto text-xs text-zinc-300 leading-relaxed font-light">
                  Solicitud recibida. Flashback revisará la disponibilidad y se pondrá en contacto contigo para confirmar.
                </div>
                {lastWhatsAppUrl && (
                  <div className="pt-2">
                    <a
                      href={lastWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 py-3 px-6 bg-white hover:bg-zinc-200 text-black text-xs uppercase tracking-[0.2em] font-sans-clean font-bold transition-all shadow-xl"
                    >
                      <MessageCircle className="w-4 h-4 fill-black" />
                      <span>Continuar por WhatsApp</span>
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 text-xs uppercase tracking-[0.2em] border border-white/20 text-zinc-300 hover:text-white hover:border-white transition-colors font-sans-clean"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (809) 000-0000"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      Sesión de Interés
                    </label>
                    <select
                      value={formData.sesion}
                      onChange={(e) => setFormData({ ...formData, sesion: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white focus:border-white focus:outline-none transition-colors"
                    >
                      {sessions.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      Fecha Tentativa
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white focus:border-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      Hora Preferida
                    </label>
                    <select
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white focus:border-white focus:outline-none transition-colors"
                    >
                      <option value="10:00 AM">10:00 AM (Mañana)</option>
                      <option value="12:00 PM">12:00 PM (Mediodía)</option>
                      <option value="03:00 PM">03:00 PM (Tarde)</option>
                      <option value="05:00 PM">05:00 PM (Atardecer)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Cuéntanos detalles o consultas que tengas..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-white hover:bg-zinc-200 text-black text-xs uppercase tracking-[0.25em] font-sans-clean font-bold transition-all shadow-xl flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Consulta</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
