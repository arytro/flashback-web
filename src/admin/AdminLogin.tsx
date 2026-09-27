import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Database,
  Key,
  Globe,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  saveSupabaseCredentialsToStorage,
  clearSupabaseCredentialsFromStorage,
  getActiveSupabaseCredentials,
} from '../lib/supabase';

export const AdminLogin: React.FC = () => {
  const { signIn, isConfigured, credentialsSource } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setup helper for preview environment if env vars aren't injected in Vite container yet
  const [showConfigHelper, setShowConfigHelper] = useState(!isConfigured);
  const creds = getActiveSupabaseCredentials();
  const [manualUrl, setManualUrl] = useState(creds.url || '');
  const [manualKey, setManualKey] = useState(creds.anonKey || '');
  const [configSuccess, setConfigSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase no está configurado aún. Ingresa la URL y Anon Key a continuación o agrégalas a las variables de entorno.'
      );
      setShowConfigHelper(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'No fue posible iniciar sesión. Verifica tus datos.');
      } else {
        // Successful login: navigate to /admin dashboard
        navigate('/admin');
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado al intentar autenticar con Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveManualConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim() || !manualKey.trim()) {
      setErrorMessage('Debes completar tanto la URL como la Anon Key de Supabase.');
      return;
    }
    saveSupabaseCredentialsToStorage(manualUrl, manualKey);
    setConfigSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleClearManualConfig = () => {
    clearSupabaseCredentialsFromStorage();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans-clean">
      {/* Header bar */}
      <header className="px-6 py-6 border-b border-zinc-900 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-xs uppercase tracking-wider font-semibold py-1.5 px-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al sitio web</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-editorial text-lg tracking-[0.25em] font-bold text-white uppercase">
            FLASHBACK
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
            / AUTH
          </span>
        </div>
      </header>

      {/* Login Card Container */}
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-white mb-2 shadow-inner">
              <Lock className="w-5 h-5 text-zinc-300" />
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-[0.1em] text-white uppercase">
              Panel Administrativo
            </h1>
            <p className="text-xs text-zinc-400 font-light max-w-xs mx-auto">
              Introduce tus credenciales de Supabase Authentication para acceder a la gestión de FLASHBACK.
            </p>
          </div>

          {/* Error notification banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start space-x-3 animate-fade-in shadow-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-white">Error de autenticación</p>
                <p className="text-red-300 text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Unconfigured Alert */}
          {!isConfigured && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-2">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">Configuración de Supabase requerida</span>
              </div>
              <p className="text-amber-300/80 text-[11px] leading-relaxed">
                Las variables <code className="bg-black/50 px-1 py-0.5 rounded text-amber-200 font-mono">VITE_SUPABASE_URL</code> y <code className="bg-black/50 px-1 py-0.5 rounded text-amber-200 font-mono">VITE_SUPABASE_ANON_KEY</code> no se detectaron en este entorno. Puedes ingresarlas abajo para probar inmediatamente.
              </p>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@flashback.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>
            </form>

            {/* Status indicator */}
            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span>
                  {isConfigured
                    ? credentialsSource === 'env'
                      ? 'Supabase Auth activo (Variables de entorno)'
                      : 'Supabase Auth activo (Sesión guardada)'
                    : 'Supabase pendiente de configuración'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigHelper(!showConfigHelper)}
                className="text-zinc-400 hover:text-white underline text-[10px] transition-colors"
              >
                {showConfigHelper ? 'Ocultar conexión' : 'Ver conexión'}
              </button>
            </div>

            {/* Collapsible Supabase connection manager for preview or local setup */}
            {showConfigHelper && (
              <div className="pt-4 border-t border-zinc-900 space-y-3 text-left animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Credenciales de Supabase</span>
                  </span>
                  {credentialsSource === 'storage' && (
                    <button
                      type="button"
                      onClick={handleClearManualConfig}
                      className="text-[10px] text-red-400 hover:text-red-300 underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  En Vercel tus variables <code className="text-white font-mono">VITE_SUPABASE_URL</code> y <code className="text-white font-mono">VITE_SUPABASE_ANON_KEY</code> se cargarán automáticamente. Si deseas probar en este entorno de previsualización ahora mismo, puedes introducirlas aquí:
                </p>

                <form onSubmit={handleSaveManualConfig} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                      Supabase Project URL
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-3" />
                      <input
                        type="url"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://xyzcompany.supabase.co"
                        className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                      Supabase Anon / Public Key
                    </label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={manualKey}
                        onChange={(e) => setManualKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Guardar y Conectar Supabase
                  </button>
                  {configSuccess && (
                    <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Conexión guardada. Recargando...</span>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="px-6 py-6 border-t border-zinc-900 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} FLASHBACK. Acceso seguro protegido con Supabase Auth.</p>
      </footer>
    </div>
  );
};
