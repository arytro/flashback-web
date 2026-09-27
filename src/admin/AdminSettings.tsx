import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Lock,
  HardDrive,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  getFlashbackConfig,
  saveFlashbackConfig,
  resetAllDemoData,
} from '../data/availability';
import { FlashbackConfig } from '../types';

export const AdminSettings: React.FC = () => {
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());
  const [formspreeEndpoint, setFormspreeEndpoint] = useState(config.formspreeEndpoint || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const fresh = getFlashbackConfig();
      setConfig(fresh);
      setFormspreeEndpoint(fresh.formspreeEndpoint || '');
    };
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveFlashbackConfig({
      formspreeEndpoint: formspreeEndpoint.trim(),
    });
    showToast('Configuración guardada.');
  };

  const handleResetData = () => {
    if (
      confirm(
        '¿Deseas restablecer todos los datos de demostración a su estado inicial? Esto restaurará las sesiones, portafolio y reservas predeterminadas.'
      )
    ) {
      resetAllDemoData();
      showToast('Datos de demostración restablecidos correctamente.');
    }
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
            Configuración & Arquitectura Supabase
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Revisa el estado de la capa de datos, integraciones de correo y los puntos de conexión para la futura integración con Supabase.
          </p>
        </div>
      </div>

      {/* Supabase Architecture Roadmap Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Arquitectura Lista para Supabase
            </h2>
            <p className="text-xs text-zinc-400">
              La aplicación está estructurada con un repositorio desacoplado para conectar Supabase en 3 capas:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Layer 1: Auth */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-white">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">1. Supabase Auth</h3>
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Autenticación segura para el fotógrafo. Cuando se conecte, la ruta <code className="text-white">/admin</code> requerirá login con email y contraseña, protegiendo las acciones.
            </p>
            <span className="inline-block text-[10px] text-emerald-400 font-mono mt-1">
              ✓ Ruta protegida preparada
            </span>
          </div>

          {/* Layer 2: Database */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-white">
              <Database className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">2. Supabase Database</h3>
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Tablas PostgreSQL para <code className="text-white">bookings</code>, <code className="text-white">availability</code>, <code className="text-white">sessions</code> y <code className="text-white">config</code>, compartidas en tiempo real entre admin y web pública.
            </p>
            <span className="inline-block text-[10px] text-blue-400 font-mono mt-1">
              ✓ Esquemas y repositorios alineados
            </span>
          </div>

          {/* Layer 3: Storage */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-white">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">3. Supabase Storage</h3>
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Bucket de almacenamiento de archivos multimedia para subir fotos del portafolio en alta resolución y el logotipo de Flashback sin tocar el código.
            </p>
            <span className="inline-block text-[10px] text-purple-400 font-mono mt-1">
              ✓ Interfaz de carga preparada
            </span>
          </div>
        </div>
      </div>

      {/* Formspree & Notifications */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Integración de Formulario (Formspree)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Si cuentas con un endpoint de Formspree para recibir copias por correo de las solicitudes de reserva, ingrésalo aquí:
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
              URL / Endpoint de Formspree
            </label>
            <input
              type="text"
              placeholder="https://formspree.io/f/xbjnvpze"
              value={formspreeEndpoint}
              onChange={(e) => setFormspreeEndpoint(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </form>
      </div>

      {/* Demo Reset Danger Zone */}
      <div className="bg-zinc-900 border border-red-900/30 p-6 sm:p-8 rounded-xl shadow space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Restablecer Datos de Demostración</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Si deseas reiniciar el estado de prueba y volver a los valores predeterminados de sesiones, portafolio y solicitudes:
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetData}
          className="px-4 py-2 bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/60 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer Todo a Estado Inicial Demo</span>
        </button>
      </div>
    </div>
  );
};
