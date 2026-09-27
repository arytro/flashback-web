import React, { useState, useEffect } from 'react';
import {
  Inbox,
  CheckCircle2,
  Calendar,
  Lock,
  Clock,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  getBookingRequests,
  getStoredAvailability,
  getSessionsList,
  getPortfolioList,
  updateBookingStatus,
} from '../data/availability';
import { BookingRequest, DayAvailability, AdminSection } from '../types';
import { useNavigation } from '../context/NavigationContext';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminSection) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { navigate } = useNavigation();
  const [bookings, setBookings] = useState<BookingRequest[]>(getBookingRequests());
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>(
    getStoredAvailability()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setBookings(getBookingRequests());
      setAvailability(getStoredAvailability());
    };
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  // Stats
  const pendingBookings = bookings.filter((b) => b.status === 'pendiente');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmada');
  const blockedDaysCount = Object.values(availability).filter((d) => d.status === 'blocked').length;

  const handleConfirm = (id: string) => {
    updateBookingStatus(id, 'confirmada');
  };

  const handleReject = (id: string) => {
    updateBookingStatus(id, 'rechazada');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-white/10 rounded-full text-[11px] text-zinc-300 font-sans-clean font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Panel de Control FLASHBACK · Modo Demo Activo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Panel de Flashback
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-xl">
            Gestiona la disponibilidad de fechas, revisa solicitudes de reservas, administra sesiones y actualiza tu portafolio en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('calendario')}
            className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-lg transition-colors flex items-center space-x-2 shadow-md"
          >
            <Calendar className="w-4 h-4" />
            <span>Gestionar Calendario</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Web Pública</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Solicitudes Pendientes */}
        <div
          onClick={() => onNavigateTab('reservas')}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-xl cursor-pointer transition-all shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Solicitudes Pendientes
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{pendingBookings.length}</span>
            <span className="text-xs text-amber-400 font-medium">Requieren atención</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 font-light">
            Nuevas consultas recibidas desde la web
          </p>
        </div>

        {/* Card 2: Reservas Confirmadas */}
        <div
          onClick={() => onNavigateTab('reservas')}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 p-6 rounded-xl cursor-pointer transition-all shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Reservas Confirmadas
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{confirmedBookings.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Agendadas</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 font-light">
            Fechas y horarios bloqueados en la web
          </p>
        </div>

        {/* Card 3: Próximas Sesiones */}
        <div
          onClick={() => onNavigateTab('calendario')}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/50 p-6 rounded-xl cursor-pointer transition-all shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Próximas Sesiones
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">
              {confirmedBookings.length > 0 ? confirmedBookings.length : '0'}
            </span>
            <span className="text-xs text-blue-400 font-medium">En cronograma</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 font-light">
            Próximos compromisos fotográficos
          </p>
        </div>

        {/* Card 4: Días Bloqueados */}
        <div
          onClick={() => onNavigateTab('calendario')}
          className="bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 p-6 rounded-xl cursor-pointer transition-all shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Días Bloqueados
            </span>
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{blockedDaysCount}</span>
            <span className="text-xs text-zinc-400 font-medium">Días cerrados</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 font-light">
            Fechas no disponibles en la web pública
          </p>
        </div>
      </div>

      {/* Central Split: Recent Requests & Quick Sync Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Pending Requests Table */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Solicitudes Recientes</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Al confirmar una solicitud, su horario se bloqueará automáticamente en la página pública.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('reservas')}
              className="text-xs text-white hover:text-zinc-300 font-medium flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800/80 overflow-x-auto">
            {bookings.slice(0, 5).map((booking) => {
              const cleanPhone = booking.clientPhone.replace(/\D/g, '');
              const waText = encodeURIComponent(
                `Hola ${booking.clientName}, te escribimos de Flashback respecto a tu solicitud para la sesión de ${booking.sessionType} el ${booking.selectedDate} a las ${booking.selectedTime}.`
              );
              const waLink = `https://wa.me/${cleanPhone}?text=${waText}`;

              return (
                <div key={booking.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-white text-sm">
                        {booking.clientName}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          booking.status === 'confirmada'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : booking.status === 'pendiente'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : booking.status === 'rechazada'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-zinc-300 font-medium">{booking.sessionType}</span>
                      <span>·</span>
                      <span>{booking.selectedDate} ({booking.selectedTime})</span>
                      <span>·</span>
                      <span>{booking.clientPhone}</span>
                    </div>

                    {booking.message && (
                      <p className="text-xs text-zinc-500 italic line-clamp-1 mt-1">
                        "{booking.message}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 rounded-lg text-xs flex items-center space-x-1"
                      title="Chatear por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    {booking.status === 'pendiente' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleConfirm(booking.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(booking.id)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 text-xs rounded-lg transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Synchronization Demo & Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold">Sincronización en Vivo</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Cualquier cambio que realices aquí (bloquear fechas, editar sesiones, agregar fotos o confirmar reservas) se refleja de inmediato en la web pública.
            </p>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigateTab('sesiones')}
                className="w-full text-left p-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 flex items-center justify-between transition-colors"
              >
                <span>Administrar nombres y precios de sesiones</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('portafolio')}
                className="w-full text-left p-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 flex items-center justify-between transition-colors"
              >
                <span>Añadir o remover fotos del portafolio</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('informacion')}
                className="w-full text-left p-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 flex items-center justify-between transition-colors"
              >
                <span>Modificar WhatsApp (@flashback.dos)</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 text-xs text-zinc-400 space-y-2">
            <span className="font-semibold text-white block">Futura Conexión Supabase</span>
            <p className="font-light leading-relaxed">
              El panel está estructurado para que el login con email/contraseña, la base de datos PostgreSQL y Supabase Storage se conecten sin tener que modificar la interfaz gráfica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
