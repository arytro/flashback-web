import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  getStoredAvailability,
  getDateAvailability,
  setDateStatus,
  setSlotStatus,
} from '../data/availability';
import { DayAvailability, TimeSlot } from '../types';

export const AdminCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [availabilityStore, setAvailabilityStore] = useState<Record<string, DayAvailability>>(
    getStoredAvailability()
  );

  const [newTimeInput, setNewTimeInput] = useState('');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => setAvailabilityStore({ ...getStoredAvailability() });
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDayIndex = (firstDayOfMonth + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar matrix
  const daysArray = useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      status: 'available' | 'blocked' | 'partially_booked';
      slotsCount: number;
      availableSlotsCount: number;
    }> = [];

    // Pre padding
    for (let i = 0; i < startingDayIndex; i++) {
      days.push({
        dateStr: `prev-${i}`,
        dayNumber: 0,
        isCurrentMonth: false,
        status: 'blocked',
        slotsCount: 0,
        availableSlotsCount: 0,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayPad = String(d).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayPad}`;

      const dayData = availabilityStore[dateString] || getDateAvailability(dateString);
      const availCount = dayData.slots.filter((s) => s.status === 'available').length;

      days.push({
        dateStr: dateString,
        dayNumber: d,
        isCurrentMonth: true,
        status: dayData.status,
        slotsCount: dayData.slots.length,
        availableSlotsCount: availCount,
      });
    }

    return days;
  }, [year, month, startingDayIndex, daysInMonth, availabilityStore]);

  // Selected date details
  const currentDayInfo: DayAvailability = useMemo(() => {
    if (!selectedDateStr) return { date: '', status: 'available', slots: [] };
    return availabilityStore[selectedDateStr] || getDateAvailability(selectedDateStr);
  }, [selectedDateStr, availabilityStore]);

  // Admin Actions
  const handleToggleDayBlock = () => {
    const nextStatus = currentDayInfo.status === 'blocked' ? 'available' : 'blocked';
    setDateStatus(selectedDateStr, nextStatus);
    showToast(
      nextStatus === 'blocked'
        ? `Día ${selectedDateStr} bloqueado. La web pública ahora lo mostrará como no disponible.`
        : `Día ${selectedDateStr} desbloqueado. La web pública ahora lo mostrará como disponible.`
    );
  };

  const handleToggleSlotStatus = (time: string, currentStatus: 'available' | 'booked' | 'blocked') => {
    let nextStatus: 'available' | 'booked' | 'blocked' = 'available';
    if (currentStatus === 'available') nextStatus = 'booked';
    else if (currentStatus === 'booked') nextStatus = 'blocked';
    else nextStatus = 'available';

    setSlotStatus(selectedDateStr, time, nextStatus);
    showToast(`Horario ${time} marcado como: ${nextStatus.toUpperCase()}`);
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeInput.trim()) return;

    // Add slot to current day
    const updated = { ...currentDayInfo };
    const newSlot: TimeSlot = {
      id: `${selectedDateStr}-slot-${Date.now()}`,
      time: newTimeInput.trim(),
      label: newLabelInput.trim() || undefined,
      status: 'available',
    };

    updated.slots = [...updated.slots, newSlot];
    updated.status = 'available';

    const store = getStoredAvailability();
    store[selectedDateStr] = updated;
    localStorage.setItem('flashback_availability_v2', JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('flashback_data_updated'));

    setNewTimeInput('');
    setNewLabelInput('');
    showToast(`Nuevo horario "${newSlot.time}" agregado para el ${selectedDateStr}`);
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
            Gestión de Calendario & Disponibilidad
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Los cambios de disponibilidad y horarios se reflejan en tiempo real en la página pública de FLASHBACK.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleToggleDayBlock}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all shadow ${
              currentDayInfo.status === 'blocked'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {currentDayInfo.status === 'blocked' ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Desbloquear {selectedDateStr}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Bloquear {selectedDateStr}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar left, Day Inspector right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Monthly Calendar */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow space-y-6">
          {/* Navigation header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 rounded-lg transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 rounded-lg transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <span key={d} className="text-xs font-semibold text-zinc-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return <div key={idx} className="h-14 opacity-0" />;
              }

              const isSelected = cell.dateStr === selectedDateStr;
              const isBlocked = cell.status === 'blocked';
              const isPartially = cell.status === 'partially_booked';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`relative h-14 rounded-lg flex flex-col items-center justify-between p-1.5 text-xs font-sans-clean transition-all border ${
                    isSelected
                      ? 'bg-white text-black font-bold border-white shadow-xl scale-105 z-10'
                      : isBlocked
                      ? 'bg-red-950/20 text-red-400 border-red-900/40 hover:border-red-600'
                      : isPartially
                      ? 'bg-amber-950/20 text-amber-300 border-amber-900/40 hover:border-amber-600'
                      : 'bg-zinc-800/80 text-zinc-200 border-zinc-700/80 hover:border-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  <span className="self-start text-[11px]">{cell.dayNumber}</span>

                  <div className="flex items-center space-x-1 text-[9px] self-end">
                    {isBlocked ? (
                      <span className="text-red-400 font-medium">Bloq</span>
                    ) : (
                      <span className={isSelected ? 'text-black font-semibold' : 'text-zinc-400'}>
                        {cell.availableSlotsCount} disp
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pt-4 border-t border-zinc-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Cupo reservado</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span>Bloqueado / No disponible</span>
            </div>
          </div>
        </div>

        {/* Right: Inspector for Selected Day */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow space-y-6">
          <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Configuración del Día
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{selectedDateStr}</h3>
            </div>

            <span
              className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                currentDayInfo.status === 'blocked'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : currentDayInfo.status === 'partially_booked'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {currentDayInfo.status === 'blocked'
                ? 'Bloqueado'
                : currentDayInfo.status === 'partially_booked'
                ? 'Parcial'
                : 'Disponible'}
            </span>
          </div>

          {/* Time Slots List for this day */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Horarios Programados
              </h4>
              <span className="text-[11px] text-zinc-500">Haz clic para rotar estado</span>
            </div>

            <div className="space-y-2">
              {currentDayInfo.slots.map((slot) => {
                const isAvail = slot.status === 'available';
                const isBooked = slot.status === 'booked';
                const isBlocked = slot.status === 'blocked';

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleToggleSlotStatus(slot.time, slot.status)}
                    className="p-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <div>
                        <span className="text-sm font-semibold text-white font-mono">
                          {slot.time}
                        </span>
                        {slot.label && (
                          <span className="text-xs text-zinc-400 block -mt-0.5">
                            {slot.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded ${
                        isAvail
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isBooked
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isAvail ? 'Disponible' : isBooked ? 'Ocupado' : 'Bloqueado'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add custom slot form */}
          <form onSubmit={handleAddCustomSlot} className="pt-4 border-t border-zinc-800 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Agregar Horario para este Día
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Ej: 08:30 AM"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-white rounded-lg placeholder-zinc-500 focus:outline-none focus:border-white"
              />
              <input
                type="text"
                placeholder="Etiqueta (opcional)"
                value={newLabelInput}
                onChange={(e) => setNewLabelInput(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-white rounded-lg placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg border border-zinc-700 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Horario</span>
            </button>
          </form>

          {/* Live Link Verification Tip */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-400 leading-relaxed font-light">
            <strong>Prueba de sincronización:</strong> Si bloqueas este día o cambias un horario aquí, abre la página pública en otra pestaña o vuelve al inicio y verás el cambio reflejado al instante.
          </div>
        </div>
      </div>
    </div>
  );
};
