import {
  DayAvailability,
  TimeSlot,
  BookingRequest,
  BookingStatus,
  FlashbackConfig,
  SessionDetail,
  PortfolioItem,
  DaySchedule,
} from '../types';
import {
  FLASHBACK_CONFIG,
  INITIAL_SESSIONS,
  INITIAL_PORTFOLIO,
  INITIAL_BOOKINGS,
  DEFAULT_WEEKLY_SCHEDULE,
} from './flashbackData';

// Local storage keys - Architecture prepared for 1:1 replacement with Supabase tables
export const STORAGE_KEYS = {
  AVAILABILITY: 'flashback_availability_v2',
  CONFIG: 'flashback_config_v2',
  SESSIONS: 'flashback_sessions_v2',
  PORTFOLIO: 'flashback_portfolio_v2',
  BOOKINGS: 'flashback_bookings_v2',
  SCHEDULE: 'flashback_schedule_v2',
};

// Standard slot template for any working day
export const DEFAULT_DAILY_TIME_SLOTS: Omit<TimeSlot, 'id'>[] = [
  { time: '10:00 AM', label: 'Mañana / Luz Difusa', status: 'available' },
  { time: '12:00 PM', label: 'Mediodía / Alto Contraste', status: 'available' },
  { time: '03:00 PM', label: 'Tarde / Luz Natural', status: 'available' },
  { time: '05:00 PM', label: 'Atardecer / Golden Hour', status: 'available' },
];

/**
 * Dispatch reactive change events so public & admin components update in real-time
 */
export const notifyStoreUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('flashback_data_updated'));
  }
};

/**
 * Initial calendar seeding
 */
function getInitialCalendarState(): Record<string, DayAvailability> {
  const initial: Record<string, DayAvailability> = {};
  const today = new Date();

  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 Sunday, 6 Saturday

    const slots: TimeSlot[] = DEFAULT_DAILY_TIME_SLOTS.map((slot, index) => ({
      ...slot,
      id: `${dateStr}-slot-${index}`,
    }));

    // Example sample blocked dates (e.g. Oct 10, or selected days)
    if (i === 4 || i === 12 || i === 25 || i === 40) {
      initial[dateStr] = {
        date: dateStr,
        status: 'blocked',
        note: 'Día bloqueado por el fotógrafo',
        slots: slots.map((s) => ({ ...s, status: 'blocked' })),
      };
    } else if (dayOfWeek === 6 || dayOfWeek === 0) {
      // Weekend: some slots booked
      if (i % 2 === 0) {
        slots[2].status = 'booked';
        initial[dateStr] = {
          date: dateStr,
          status: 'partially_booked',
          slots,
        };
      } else {
        initial[dateStr] = {
          date: dateStr,
          status: 'available',
          slots,
        };
      }
    } else {
      initial[dateStr] = {
        date: dateStr,
        status: 'available',
        slots,
      };
    }
  }

  // Pre-book demo booking confirmed slots:
  INITIAL_BOOKINGS.forEach((bk) => {
    if (bk.status === 'confirmada' && initial[bk.selectedDate]) {
      const day = initial[bk.selectedDate];
      day.slots = day.slots.map((s) =>
        s.time.toLowerCase() === bk.selectedTime.toLowerCase()
          ? { ...s, status: 'booked' }
          : s
      );
      day.status = day.slots.every((s) => s.status === 'blocked' || s.status === 'booked')
        ? 'blocked'
        : 'partially_booked';
    }
  });

  return initial;
}

/**
 * ----------------------------------------------------
 * AVAILABILITY & CALENDAR REPOSITORY
 * ----------------------------------------------------
 */
export function getStoredAvailability(): Record<string, DayAvailability> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
    if (!raw) {
      const initial = getInitialCalendarState();
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading availability from storage', e);
    return getInitialCalendarState();
  }
}

export function getDateAvailability(dateStr: string): DayAvailability {
  const store = getStoredAvailability();
  if (store[dateStr]) {
    return store[dateStr];
  }

  const slots: TimeSlot[] = DEFAULT_DAILY_TIME_SLOTS.map((slot, index) => ({
    ...slot,
    id: `${dateStr}-slot-${index}`,
  }));

  return {
    date: dateStr,
    status: 'available',
    slots,
  };
}

export function setDateStatus(
  dateStr: string,
  status: 'available' | 'blocked',
  note?: string
): DayAvailability {
  const store = getStoredAvailability();
  const existing = getDateAvailability(dateStr);

  const updatedSlots: TimeSlot[] = existing.slots.map((s) => ({
    ...s,
    status: status === 'blocked' ? 'blocked' : 'available',
  }));

  const updatedDay: DayAvailability = {
    ...existing,
    status,
    note: note || (status === 'blocked' ? 'Día bloqueado desde el Panel Administrativo' : undefined),
    slots: updatedSlots,
  };

  store[dateStr] = updatedDay;
  try {
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(store));
    notifyStoreUpdated();
  } catch (e) {
    console.error('Failed to save date status', e);
  }

  return updatedDay;
}

export function setSlotStatus(
  dateStr: string,
  timeString: string,
  status: 'available' | 'booked' | 'blocked'
): DayAvailability {
  const store = getStoredAvailability();
  const existing = getDateAvailability(dateStr);

  const updatedSlots = existing.slots.map((slot) => {
    if (slot.time.toLowerCase() === timeString.toLowerCase()) {
      return { ...slot, status };
    }
    return slot;
  });

  const allBlockedOrBooked = updatedSlots.every(
    (s) => s.status === 'blocked' || s.status === 'booked'
  );
  const someBlockedOrBooked = updatedSlots.some(
    (s) => s.status === 'booked' || s.status === 'blocked'
  );

  const newDayStatus: 'available' | 'blocked' | 'partially_booked' = allBlockedOrBooked
    ? 'blocked'
    : someBlockedOrBooked
    ? 'partially_booked'
    : 'available';

  const updatedDay: DayAvailability = {
    ...existing,
    status: newDayStatus,
    slots: updatedSlots,
  };

  store[dateStr] = updatedDay;
  try {
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(store));
    notifyStoreUpdated();
  } catch (e) {
    console.error('Failed to save slot status', e);
  }

  return updatedDay;
}

/**
 * ----------------------------------------------------
 * CONFIGURATION REPOSITORY
 * ----------------------------------------------------
 */
export function getFlashbackConfig(): FlashbackConfig {
  if (typeof window === 'undefined') return FLASHBACK_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return FLASHBACK_CONFIG;
    return { ...FLASHBACK_CONFIG, ...JSON.parse(raw) };
  } catch {
    return FLASHBACK_CONFIG;
  }
}

export function saveFlashbackConfig(partial: Partial<FlashbackConfig>): FlashbackConfig {
  const current = getFlashbackConfig();
  const updated = { ...current, ...partial };
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    notifyStoreUpdated();
  } catch (e) {
    console.error('Failed to save config', e);
  }
  return updated;
}

/**
 * ----------------------------------------------------
 * WEEKLY SCHEDULE REPOSITORY
 * ----------------------------------------------------
 */
export function getWeeklySchedule(): DaySchedule[] {
  if (typeof window === 'undefined') return DEFAULT_WEEKLY_SCHEDULE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!raw) return DEFAULT_WEEKLY_SCHEDULE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WEEKLY_SCHEDULE;
  }
}

export function saveWeeklySchedule(schedule: DaySchedule[]): DaySchedule[] {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    notifyStoreUpdated();
  } catch (e) {
    console.error('Failed to save weekly schedule', e);
  }
  return schedule;
}

/**
 * ----------------------------------------------------
 * SESSIONS REPOSITORY
 * ----------------------------------------------------
 */
export function getSessionsList(): SessionDetail[] {
  if (typeof window === 'undefined') return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveSessionsList(sessions: SessionDetail[]): SessionDetail[] {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    notifyStoreUpdated();
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
  return sessions;
}

export function createSession(newSession: Omit<SessionDetail, 'id'>): SessionDetail {
  const list = getSessionsList();
  const session: SessionDetail = {
    ...newSession,
    id: `session-${Date.now()}`,
    active: true,
  };
  saveSessionsList([...list, session]);
  return session;
}

export function updateSession(id: string, partial: Partial<SessionDetail>): SessionDetail | null {
  const list = getSessionsList();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...partial };
  saveSessionsList(list);
  return list[index];
}

export function deleteSession(id: string): boolean {
  const list = getSessionsList();
  const filtered = list.filter((s) => s.id !== id);
  saveSessionsList(filtered);
  return true;
}

/**
 * ----------------------------------------------------
 * PORTFOLIO REPOSITORY
 * ----------------------------------------------------
 */
export function getPortfolioList(): PortfolioItem[] {
  if (typeof window === 'undefined') return INITIAL_PORTFOLIO;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(INITIAL_PORTFOLIO));
      return INITIAL_PORTFOLIO;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PORTFOLIO;
  }
}

export function savePortfolioList(portfolio: PortfolioItem[]): PortfolioItem[] {
  try {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
    notifyStoreUpdated();
  } catch (e) {
    console.error('Failed to save portfolio', e);
  }
  return portfolio;
}

export function createPortfolioItem(newItem: Omit<PortfolioItem, 'id'>): PortfolioItem {
  const list = getPortfolioList();
  const item: PortfolioItem = {
    ...newItem,
    id: `portfolio-${Date.now()}`,
    active: true,
  };
  savePortfolioList([item, ...list]);
  return item;
}

export function updatePortfolioItem(id: string, partial: Partial<PortfolioItem>): PortfolioItem | null {
  const list = getPortfolioList();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...partial };
  savePortfolioList(list);
  return list[index];
}

export function deletePortfolioItem(id: string): boolean {
  const list = getPortfolioList();
  const filtered = list.filter((p) => p.id !== id);
  savePortfolioList(filtered);
  return true;
}

/**
 * ----------------------------------------------------
 * BOOKING REQUESTS REPOSITORY
 * ----------------------------------------------------
 */
export function getBookingRequests(): BookingRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookingRequests(bookings: BookingRequest[]): BookingRequest[] {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    notifyStoreUpdated();
  } catch (e) {
    console.error('Failed to save bookings', e);
  }
  return bookings;
}

export function submitBookingRequest(
  request: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>
): BookingRequest {
  const current = getBookingRequests();
  const newBooking: BookingRequest = {
    ...request,
    id: `fb-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'pendiente',
  };

  const updated = [newBooking, ...current];
  saveBookingRequests(updated);
  return newBooking;
}

/**
 * Confirm / Reject / Cancel Booking
 * When confirmed: automatically marks slot as booked so public calendar updates!
 */
export function updateBookingStatus(id: string, status: BookingStatus): BookingRequest | null {
  const list = getBookingRequests();
  const index = list.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const prevBooking = list[index];
  list[index] = { ...prevBooking, status };
  saveBookingRequests(list);

  // If confirmed, automatically occupy that slot on the public calendar!
  if (status === 'confirmada' && prevBooking.selectedDate && prevBooking.selectedTime) {
    setSlotStatus(prevBooking.selectedDate, prevBooking.selectedTime, 'booked');
  }

  // If was confirmed and is now rejected/cancelled, free up the slot if appropriate
  if (
    prevBooking.status === 'confirmada' &&
    (status === 'cancelada' || status === 'rechazada') &&
    prevBooking.selectedDate &&
    prevBooking.selectedTime
  ) {
    setSlotStatus(prevBooking.selectedDate, prevBooking.selectedTime, 'available');
  }

  return list[index];
}

/**
 * Reset all demo data to pristine initial state
 */
export function resetAllDemoData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AVAILABILITY);
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
  localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
  notifyStoreUpdated();
}

/**
 * Builds pre-filled WhatsApp message as requested:
 * "Hola, me interesa realizar una sesión con Flashback. Estoy interesado en [SERVICIO] para el [FECHA] a las [HORA]."
 */
export function buildFlashbackWhatsAppUrl(params: {
  session?: string;
  date?: string;
  time?: string;
  clientName?: string;
  customNote?: string;
}): string {
  const config = getFlashbackConfig();
  const sessionName = params.session || 'una sesión fotográfica';
  const dateFormatted = params.date || 'una fecha próxima';
  const timeFormatted = params.time ? ` a las ${params.time}` : '';

  let message = `Hola, me interesa realizar una sesión con Flashback. Estoy interesado en ${sessionName} para el ${dateFormatted}${timeFormatted}.`;

  if (params.clientName?.trim()) {
    message += ` Mi nombre es ${params.clientName.trim()}.`;
  }

  if (params.customNote?.trim()) {
    message += ` Mensaje: ${params.customNote.trim()}`;
  }

  const cleanPhone = config.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
