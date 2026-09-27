import React, { useState, useEffect } from 'react';
import {
  Clock,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  getWeeklySchedule,
  saveWeeklySchedule,
  setDateStatus,
  getStoredAvailability,
} from '../data/availability';
import { DaySchedule } from '../types';

export const AdminSchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(getWeeklySchedule());
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionStatus, setExceptionStatus] = useState<'blocked' | 'available'>('blocked');
  const [exceptionReason, setExceptionReason] = useState('Feriado / Asueto personal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => setSchedule(getWeeklySchedule());
    window.addEventListener('flashback_data_updated', handleUpdate);
    return () => window.removeEventListener('flashback_data_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    setSchedule(updated);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSaveGeneralSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    saveWeeklySchedule(schedule);
    showToast('¡Horarios semanales guardados!');
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionDate) return;

    setDateStatus(exceptionDate, exceptionStatus, exceptionReason);
    showToast(
      exceptionStatus === 'blocked'
        ? `Excepción guardada: ${exceptionDate} bloqueado como no disponible.`
        : `Excepción guardada: ${exceptionDate} habilitado como disponible.`
    );
    setExceptionDate('');
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
            Configuración de Horarios & Excepciones
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Define la jornada general de atención y fechas excepcionales que tienen prioridad sobre la agenda semanal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveGeneralSchedule}
          className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Horarios</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: General Weekly Schedule */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Horarios Generales de la Semana</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Establece qué días estás disponible para realizar sesiones fotográficas.
            </p>
          </div>

          <form onSubmit={handleSaveGeneralSchedule} className="space-y-3">
            {schedule.map((day, idx) => (
              <div
                key={day.dayOfWeek}
                className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  day.enabled
                    ? 'bg-zinc-800/60 border-zinc-700/80'
                    : 'bg-zinc-950/60 border-zinc-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className="text-zinc-300 hover:text-white"
                  >
                    {day.enabled ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-zinc-600" />
                    )}
                  </button>

                  <span className={`text-sm font-semibold ${day.enabled ? 'text-white' : 'text-zinc-500'}`}>
                    {day.dayName}
                  </span>
                </div>

                {day.enabled ? (
                  <div className="flex items-center space-x-2 text-xs">
                    <input
                      type="text"
                      value={day.startTime}
                      onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-white rounded text-center font-mono w-24 focus:outline-none focus:border-white"
                    />
                    <span className="text-zinc-500">hasta</span>
                    <input
                      type="text"
                      value={day.endTime}
                      onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-white rounded text-center font-mono w-24 focus:outline-none focus:border-white"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500 italic">No disponible</span>
                )}
              </div>
            ))}

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg border border-zinc-700 transition-colors"
              >
                Aplicar Horarios Generales
              </button>
            </div>
          </form>
        </div>

        {/* Right: Specific Exceptions */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>Excepciones Específicas</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Las excepciones tienen prioridad sobre los horarios generales (ejemplo: 25 de Octubre → No disponible).
            </p>
          </div>

          <form onSubmit={handleAddException} className="space-y-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Fecha de Excepción *
              </label>
              <input
                type="date"
                required
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Estado para esta fecha
              </label>
              <select
                value={exceptionStatus}
                onChange={(e) => setExceptionStatus(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              >
                <option value="blocked">Bloqueado / No disponible</option>
                <option value="available">Habilitado como Disponible</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">
                Motivo / Nota Interna
              </label>
              <input
                type="text"
                placeholder="Ej: Feriado, viaje fotográfico, sesión externa..."
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Excepción</span>
            </button>
          </form>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 text-xs text-zinc-400">
            <span className="font-semibold text-white block">Prioridad de Reglas</span>
            <p className="font-light leading-relaxed">
              Si un miércoles está marcado como "No disponible" en el horario general, pero defines una excepción para habilitar un miércoles específico, la página pública respetará la excepción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
