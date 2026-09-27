import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Inbox,
  Camera,
  Image,
  Building,
  Clock,
  Settings,
  ExternalLink,
  Menu,
  X,
  Database,
  Sparkles,
  ArrowLeft,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { AdminSection } from '../types';
import { getBookingRequests, getFlashbackConfig } from '../data/availability';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

import { AdminDashboard } from './AdminDashboard';
import { AdminCalendar } from './AdminCalendar';
import { AdminBookings } from './AdminBookings';
import { AdminSessions } from './AdminSessions';
import { AdminPortfolio } from './AdminPortfolio';
import { AdminBusinessInfo } from './AdminBusinessInfo';
import { AdminSchedule } from './AdminSchedule';
import { AdminSettings } from './AdminSettings';

export const AdminLayout: React.FC = () => {
  const { navigate } = useNavigation();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminSection>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const config = getFlashbackConfig();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const updateCounts = () => {
      const requests = getBookingRequests();
      setPendingCount(requests.filter((r) => r.status === 'pendiente').length);
    };
    updateCounts();
    window.addEventListener('flashback_data_updated', updateCounts);
    return () => window.removeEventListener('flashback_data_updated', updateCounts);
  }, []);

  const navItems: Array<{ id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'reservas', label: 'Reservas', icon: Inbox, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'sesiones', label: 'Sesiones', icon: Camera },
    { id: 'portafolio', label: 'Portafolio', icon: Image },
    { id: 'informacion', label: 'Información', icon: Building },
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans-clean">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
            aria-label="Abrir menú de navegación"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-xs uppercase tracking-wider font-semibold py-1 px-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Volver a</span>
            <span>Web Pública</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

          <div className="hidden sm:flex items-center space-x-2">
            <span className="font-editorial text-xl font-bold tracking-[0.2em] text-white uppercase">
              FLASHBACK
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
              / ADMIN
            </span>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user?.email && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[180px]">{user.email}</span>
            </div>
          )}

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
            title="Ver sitio web público"
          >
            <span className="hidden sm:inline">Ver</span>
            <span>Web</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 shadow cursor-pointer disabled:opacity-50"
            title="Cerrar sesión de Supabase"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-grow flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-20 h-[calc(100vh-64px)] w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between p-4 transition-transform duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Nav List */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Navegación
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-black text-white' : 'bg-amber-500 text-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Connection Card */}
          <div className="space-y-2 pt-2 border-t border-zinc-900">
            {user && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Usuario Activo</p>
                    <p className="text-xs text-white truncate font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 pt-1 border-t border-zinc-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Supabase Auth autenticado</span>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full mt-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}

            {!user && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conexión Supabase</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  Autenticación con Supabase activa.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-grow p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'calendario' && <AdminCalendar />}
          {activeTab === 'reservas' && <AdminBookings />}
          {activeTab === 'sesiones' && <AdminSessions />}
          {activeTab === 'portafolio' && <AdminPortfolio />}
          {activeTab === 'informacion' && <AdminBusinessInfo />}
          {activeTab === 'horarios' && <AdminSchedule />}
          {activeTab === 'configuracion' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
