import React, { useState, useEffect } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MessageCircle,
  Filter,
  Calendar,
  Sparkles,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import {
  getBookingRequests,
  updateBookingStatus,
} from '../data/availability';
import { BookingRequest, BookingStatus } from '../types';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>(getBookingRequests());
  const [statusFilter, setStatusFilter] = useState<'todas' | BookingStatus>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => setBookings(getBookingRequests());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = (id: string, newStatus: BookingStatus, clientName: string) => {
    updateBookingStatus(id, newStatus);
    showToast(
      newStatus === 'confirmada'
        ? `¡Reserva de ${clientName} confirmada! La fecha y horario se han marcado como ocupados en la página pública.`
        : `Solicitud de ${clientName} marcada como ${newStatus}.`
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'todas' || b.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.clientName.toLowerCase().includes(term) ||
      b.clientEmail.toLowerCase().includes(term) ||
      b.clientPhone.includes(term) ||
      b.sessionType.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

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
            Gestión de Reservas & Solicitudes
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Al confirmar una solicitud, el horario seleccionado se bloquea automáticamente en la web pública para evitar duplicados.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <span>Total: <strong className="text-white">{bookings.length}</strong> solicitudes</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['todas', 'pendiente', 'confirmada', 'rechazada', 'cancelada'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? 'bg-white text-black font-semibold shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o sesión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 pl-9 pr-3 py-1.5 text-xs text-white rounded-lg placeholder-zinc-500 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No se encontraron solicitudes</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No hay solicitudes que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const cleanPhone = b.clientPhone.replace(/\D/g, '');
            const waText = encodeURIComponent(
              `Hola ${b.clientName}, te escribimos de Flashback sobre tu solicitud para la sesión de ${b.sessionType} programada tentativamente para el ${b.selectedDate} a las ${b.selectedTime}.`
            );
            const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

            return (
              <div
                key={b.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-6 rounded-xl shadow transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Details */}
                <div className="space-y-3 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>{b.clientName}</span>
                    </h3>

                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        b.status === 'confirmada'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'pendiente'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : b.status === 'rechazada'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {b.status}
                    </span>

                    <span className="text-xs text-zinc-500">
                      ID: {b.id}
                    </span>
                  </div>

                  {/* Meta items */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300">
                    <div className="flex items-center space-x-2 bg-zinc-800/60 p-2 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span><strong>Sesión:</strong> {b.sessionType}</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-zinc-800/60 p-2 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span><strong>Fecha:</strong> {b.selectedDate} ({b.selectedTime})</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-zinc-800/60 p-2 rounded-lg">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span><strong>Tel:</strong> {b.clientPhone}</span>
                    </div>
                  </div>

                  {/* Client Email & Message */}
                  <div className="space-y-1 text-xs text-zinc-400">
                    <div className="flex items-center space-x-2 text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{b.clientEmail}</span>
                    </div>

                    {b.message && (
                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 italic text-xs mt-2">
                        “{b.message}”
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Button Bar */}
                <div className="flex flex-wrap lg:flex-col items-stretch justify-end gap-2 shrink-0 min-w-[170px]">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  {b.status === 'pendiente' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(b.id, 'confirmada', b.clientName)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Reserva</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(b.id, 'rechazada', b.clientName)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-xs rounded-lg transition-colors flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </>
                  )}

                  {b.status === 'confirmada' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b.id, 'cancelada', b.clientName)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-xs rounded-lg transition-colors"
                    >
                      Cancelar Reserva
                    </button>
                  )}

                  {(b.status === 'rechazada' || b.status === 'cancelada') && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b.id, 'pendiente', b.clientName)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
                    >
                      Reabrir como Pendiente
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
