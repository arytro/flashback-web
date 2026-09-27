import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageCircle,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import {
  getDateAvailability,
  getStoredAvailability,
  setDateStatus,
  setSlotStatus,
  getFlashbackConfig,
  saveFlashbackConfig,
  getSessionsList,
  submitBookingRequest,
  buildFlashbackWhatsAppUrl,
} from '../data/availability';
import { DayAvailability, TimeSlot, FlashbackConfig, SessionDetail } from '../types';

interface AvailabilityCalendarProps {
  preselectedSession?: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  preselectedSession,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  const [sessions, setSessions] = useState<SessionDetail[]>(getSessionsList());
  const [selectedSession, setSelectedSession] = useState<string>(
    preselectedSession || sessions[0]?.title || 'Sesiones personales'
  );

  // Client Form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientMessage, setClientMessage] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{
    id: string;
    session: string;
    date: string;
    time: string;
    name: string;
    whatsappUrl: string;
  } | null>(null);

  // Shared Data Layer state
  const [config, setConfig] = useState<FlashbackConfig>(getFlashbackConfig());
  const [availabilityStore, setAvailabilityStore] = useState<Record<string, DayAvailability>>(
    getStoredAvailability()
  );

  // Admin Simulator state for testing shared database sync
  const [showAdminTool, setShowAdminTool] = useState(false);
  const [adminPhoneInput, setAdminPhoneInput] = useState('');

  // Sync if preselectedSession changes from parent
  useEffect(() => {
    if (preselectedSession) {
      setSelectedSession(preselectedSession);
    }
  }, [preselectedSession]);

  // Reactive listener: update if admin or storage changes
  useEffect(() => {
    const handleUpdate = () => {
      setAvailabilityStore({ ...getStoredAvailability() });
      setConfig(getFlashbackConfig());
      setSessions(getSessionsList());
    };

    window.addEventListener('flashback_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('flashback_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Pick first available upcoming date
  useEffect(() => {
    if (!selectedDateStr) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const str = tomorrow.toISOString().split('T')[0];
      const dayData = getDateAvailability(str);
      setSelectedDateStr(str);

      const firstAvail = dayData.slots.find((s) => s.status === 'available');
      if (firstAvail) {
        setSelectedTimeSlot(firstAvail.time);
      }
    }
  }, [selectedDateStr]);

  // Calendar matrix calculations
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

  const daysArray = useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      status: 'available' | 'blocked' | 'partially_booked';
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Padding before 1st of month
    for (let i = 0; i < startingDayIndex; i++) {
      days.push({
        dateStr: `prev-${i}`,
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        status: 'blocked',
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayPad = String(d).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayPad}`;

      const isPast = dateString < todayStr;
      const dayData = availabilityStore[dateString] || getDateAvailability(dateString);

      days.push({
        dateStr: dateString,
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
        status: isPast ? 'blocked' : dayData.status,
      });
    }

    return days;
  }, [year, month, startingDayIndex, daysInMonth, availabilityStore]);

  // Currently selected date info
  const currentDayInfo: DayAvailability = useMemo(() => {
    if (!selectedDateStr) return { date: '', status: 'available', slots: [] };
    return availabilityStore[selectedDateStr] || getDateAvailability(selectedDateStr);
  }, [selectedDateStr, availabilityStore]);

  const handleSelectDate = (dateStr: string, isPast: boolean, status: string) => {
    if (isPast || status === 'blocked') return;
    setSelectedDateStr(dateStr);

    const dayData = availabilityStore[dateStr] || getDateAvailability(dateStr);
    const availableSlots = dayData.slots.filter((s) => s.status === 'available');
    if (availableSlots.length > 0) {
      const currentExists = availableSlots.some((s) => s.time === selectedTimeSlot);
      if (!currentExists) {
        setSelectedTimeSlot(availableSlots[0].time);
      }
    } else {
      setSelectedTimeSlot('');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr || !selectedTimeSlot) return;

    setIsSubmitting(true);

    try {
      // Optional Formspree endpoint support
      if (config.formspreeEndpoint) {
        try {
          await fetch(config.formspreeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: clientName,
              telefono: clientPhone,
              email: clientEmail,
              sesion: selectedSession,
              fecha: selectedDateStr,
              hora: selectedTimeSlot,
              mensaje: clientMessage,
            }),
          });
        } catch (err) {
          console.error('Formspree dispatch error', err);
        }
      }

      // Record in shared data store
      const newBooking = submitBookingRequest({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        sessionType: selectedSession,
        selectedDate: selectedDateStr,
        selectedTime: selectedTimeSlot,
        message: clientMessage.trim(),
      });

      const waUrl = buildFlashbackWhatsAppUrl({
        session: selectedSession,
        date: selectedDateStr,
        time: selectedTimeSlot,
        clientName: clientName.trim(),
        customNote: clientMessage.trim(),
      });

      setSubmittedRequest({
        id: newBooking.id,
        session: selectedSession,
        date: selectedDateStr,
        time: selectedTimeSlot,
        name: clientName.trim(),
        whatsappUrl: waUrl,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const liveWhatsAppUrl = useMemo(() => {
    return buildFlashbackWhatsAppUrl({
      session: selectedSession,
      date: selectedDateStr,
      time: selectedTimeSlot,
      clientName: clientName,
      customNote: clientMessage,
    });
  }, [selectedSession, selectedDateStr, selectedTimeSlot, clientName, clientMessage]);

  // Admin simulation actions
  const handleToggleBlockDate = () => {
    if (!selectedDateStr) return;
    const nextStatus = currentDayInfo.status === 'blocked' ? 'available' : 'blocked';
    setDateStatus(selectedDateStr, nextStatus);
  };

  const handleToggleSlot = (time: string) => {
    if (!selectedDateStr) return;
    const slot = currentDayInfo.slots.find((s) => s.time === time);
    if (!slot) return;
    const nextStatus = slot.status === 'available' ? 'booked' : 'available';
    setSlotStatus(selectedDateStr, time, nextStatus);
  };

  const handleUpdateAdminPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPhoneInput.trim()) {
      saveFlashbackConfig({
        whatsappNumber: adminPhoneInput.replace(/\D/g, ''),
        whatsappDisplay: adminPhoneInput.trim(),
      });
      alert('Número de WhatsApp de Flashback actualizado.');
    }
  };

  return (
    <section
      id="disponibilidad"
      className="relative w-full bg-black text-white py-24 md:py-32 px-6 md:px-12 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.35em] text-zinc-400 font-sans-clean font-semibold block mb-3">
            Agenda & Sesiones
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none mb-4 font-medium">
            Disponibilidad
          </h2>
          <p className="font-sans-clean text-xs sm:text-sm text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
            Selecciona una fecha y horario disponible para tu sesión. Coordinamos cada encuentro con antelación para garantizar la luz y el ambiente perfecto.
          </p>

          <div className="mt-5 inline-flex items-center space-x-2 border border-white/15 bg-zinc-950 px-4 py-1.5 text-[11px] text-zinc-300 font-sans-clean">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>Las reservas se gestionan como solicitud previa para verificación de agenda.</span>
          </div>
        </div>

        {submittedRequest ? (
          /* Confirmation Message state as strictly specified */
          <div className="max-w-2xl mx-auto bg-zinc-950 border border-white/20 p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white flex items-center justify-center mx-auto text-white">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-sans-clean font-semibold">
                FLASHBACK · Solicitud Recibida
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-white font-medium">
                Sesión Solicitada
              </h3>
            </div>

            {/* Exact required wording */}
            <div className="bg-black border border-white/10 p-6 text-left text-xs sm:text-sm text-zinc-300 font-light leading-relaxed space-y-3">
              <p className="font-medium text-white">
                Detalles: <strong>{submittedRequest.session}</strong> · Fecha: <strong>{submittedRequest.date}</strong> ({submittedRequest.time})
              </p>
              <p className="text-zinc-400 italic">
                “Solicitud recibida. Flashback revisará la disponibilidad y se pondrá en contacto contigo para confirmar.”
              </p>
            </div>

            {/* Direct WhatsApp Action with prefilled message */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-zinc-400 font-sans-clean">
                ¿Prefieres coordinar de inmediato por WhatsApp?
              </p>
              <a
                href={submittedRequest.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-white hover:bg-zinc-200 text-black text-xs uppercase tracking-[0.22em] font-sans-clean font-bold transition-all shadow-xl flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>Continuar por WhatsApp</span>
              </a>
              <p className="text-[10px] text-zinc-500 font-mono">
                WhatsApp: {config.whatsappDisplay}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSubmittedRequest(null)}
                className="text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white underline underline-offset-4 font-sans-clean"
              >
                Elegir otra fecha o sesión
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Calendar & Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Monochromatic Calendar & Hours */}
            <div className="lg:col-span-6 bg-zinc-950 border border-white/10 p-6 sm:p-8 space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-editorial text-2xl text-white font-medium">
                    {monthNames[month]} {year}
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-sans-clean">
                    Calendario FLASHBACK
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Mes anterior"
                    className="p-2 border border-white/10 text-zinc-300 hover:text-white hover:border-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Mes siguiente"
                    className="p-2 border border-white/10 text-zinc-300 hover:text-white hover:border-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                  <span
                    key={d}
                    className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-sans-clean py-1 font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {daysArray.map((cell, idx) => {
                  if (!cell.isCurrentMonth) {
                    return <div key={idx} className="h-10 sm:h-12 opacity-0" />;
                  }

                  const isSelected = cell.dateStr === selectedDateStr;
                  const isBlocked = cell.status === 'blocked' || cell.isPast;
                  const isPartially = cell.status === 'partially_booked';

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => handleSelectDate(cell.dateStr, cell.isPast, cell.status)}
                      className={`relative h-10 sm:h-12 flex flex-col items-center justify-center text-xs font-sans-clean transition-all border ${
                        isSelected
                          ? 'bg-white text-black font-bold border-white shadow-xl scale-105 z-10'
                          : isBlocked
                          ? 'bg-black/60 text-zinc-700 border-transparent cursor-not-allowed line-through'
                          : isPartially
                          ? 'bg-zinc-900 text-white border-white/20 hover:border-white'
                          : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/50 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{cell.dayNumber}</span>
                      {!isBlocked && (
                        <span
                          className={`w-1 h-1 rounded-full mt-0.5 ${
                            isSelected ? 'bg-black' : isPartially ? 'bg-zinc-400' : 'bg-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400 font-sans-clean pt-3 border-t border-white/10">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>Disponible</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                  <span>Horarios reducidos</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <span>No disponible</span>
                </div>
              </div>

              {/* Time Slots */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-white font-sans-clean font-medium flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Horarios para {selectedDateStr || 'fecha elegida'}</span>
                  </span>
                  {currentDayInfo.status === 'blocked' && (
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Día no disponible</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {currentDayInfo.slots.map((slot) => {
                    const isAvailable = slot.status === 'available';
                    const isCurrentSlotSelected = selectedTimeSlot === slot.time;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-3 text-left border text-xs font-sans-clean transition-all flex flex-col justify-between ${
                          isCurrentSlotSelected && isAvailable
                            ? 'bg-white text-black border-white font-bold shadow'
                            : isAvailable
                            ? 'bg-zinc-900 text-white border-white/10 hover:border-white/40'
                            : 'bg-black text-zinc-700 border-transparent cursor-not-allowed opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">{slot.time}</span>
                          <span
                            className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${
                              isCurrentSlotSelected && isAvailable
                                ? 'bg-black text-white'
                                : isAvailable
                                ? 'text-zinc-300'
                                : 'text-zinc-700'
                            }`}
                          >
                            {isAvailable ? 'Disponible' : 'Ocupado'}
                          </span>
                        </div>
                        {slot.label && (
                          <span
                            className={`text-[10px] mt-1 truncate ${
                              isCurrentSlotSelected && isAvailable ? 'text-zinc-800' : 'text-zinc-500'
                            }`}
                          >
                            {slot.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discrete Simulator Toggle for Admin sync testing */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminTool(!showAdminTool)}
                  className="w-full text-center py-2 text-[11px] text-zinc-500 hover:text-white flex items-center justify-center space-x-1.5 transition-colors font-sans-clean"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>
                    {showAdminTool
                      ? 'Ocultar Simulador de Sincronización'
                      : 'Simular Panel Administrativo (Probar Bloqueo en Vivo)'}
                  </span>
                </button>

                {showAdminTool && (
                  <div className="mt-3 p-4 bg-black border border-white/20 text-xs space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">
                        Conexión Base de Datos Compartida
                      </span>
                      <span className="text-[10px] text-zinc-500">Panel &lt;-&gt; Web</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                      Simula cómo el fotógrafo desde el panel administrativo bloquea/habilita fechas y horarios en la base de datos compartida:
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleToggleBlockDate}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] border border-white/20 font-medium"
                      >
                        {currentDayInfo.status === 'blocked'
                          ? `Habilitar (${selectedDateStr})`
                          : `Bloquear (${selectedDateStr})`}
                      </button>

                      {currentDayInfo.slots.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleToggleSlot(s.time)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-300 border border-white/10"
                        >
                          {s.time}: {s.status === 'available' ? 'Bloquear' : 'Liberar'}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleUpdateAdminPhone} className="pt-2 border-t border-white/10 flex gap-2">
                      <input
                        type="text"
                        placeholder="Editar WhatsApp (+1 809...)"
                        value={adminPhoneInput}
                        onChange={(e) => setAdminPhoneInput(e.target.value)}
                        className="bg-zinc-900 border border-white/10 px-2 py-1 text-[11px] text-white flex-grow focus:outline-none focus:border-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-white text-black font-bold text-[10px] uppercase tracking-wider"
                      >
                        Guardar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Booking Request Form & Direct WhatsApp Channel */}
            <div className="lg:col-span-6 bg-zinc-950 border border-white/10 p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-sans-clean font-semibold block mb-1">
                  Paso 2
                </span>
                <h3 className="font-editorial text-3xl text-white font-medium">
                  Solicitud de Reserva
                </h3>
                <p className="text-xs text-zinc-400 font-sans-clean font-light mt-1">
                  Completa los datos para registrar tu solicitud. Flashback te responderá para validar los detalles.
                </p>
              </div>

              {/* Summary of chosen date/time */}
              <div className="p-4 bg-black border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block font-sans-clean">
                    Fecha
                  </span>
                  <span className="text-sm font-semibold text-white font-mono">
                    {selectedDateStr || 'Selecciona una fecha'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block font-sans-clean">
                    Horario
                  </span>
                  <span className="text-sm font-semibold text-zinc-200 font-mono">
                    {selectedTimeSlot || 'Selecciona horario'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Session Type */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                    Tipo de Sesión *
                  </label>
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white focus:border-white focus:outline-none transition-colors"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                    <option value="Otra propuesta creativa">Otra propuesta creativa</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                      WhatsApp / Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (809) 000-0000"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-zinc-400 font-sans-clean mb-1.5">
                    Mensaje / Idea de la Sesión
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Cuéntanos qué tienes en mente, locación preferida o estilo deseado..."
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    className="w-full bg-black border border-white/10 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedDateStr || !selectedTimeSlot}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black text-xs uppercase tracking-[0.25em] font-sans-clean font-bold transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Solicitud de Reserva</span>
                  </button>

                  {/* Or prefilled WhatsApp directly */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/10" />
                    <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-sans-clean">
                      O continuar directo
                    </span>
                    <div className="flex-grow border-t border-white/10" />
                  </div>

                  <a
                    href={liveWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 border border-white/20 hover:border-white bg-black hover:bg-zinc-900 text-white text-xs uppercase tracking-[0.2em] font-sans-clean font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contactar por WhatsApp ahora</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
