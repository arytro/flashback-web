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
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Supabase table names — mirror 1:1 with STORAGE_KEYS below
const SUPABASE_TABLES = {
  CONFIG: 'flashback_config',
  SESSIONS: 'flashback_sessions',
  PORTFOLIO: 'flashback_portfolio',
  BOOKINGS: 'flashback_bookings',
  SCHEDULE: 'flashback_schedule',
  AVAILABILITY: 'flashback_availability',
};

const SCHEDULE_ORDER = [1, 2, 3, 4, 5, 6, 0];

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
 * ----------------------------------------------------
 * SUPABASE SYNC LAYER
 * localStorage sigue siendo la fuente de lectura inmediata (rápida,
 * sin parpadeos), pero cada escritura se replica a Supabase en segundo
 * plano y los cambios remotos (desde otro dispositivo) se traen vía
 * Realtime y se vuelcan sobre localStorage automáticamente.
 * ----------------------------------------------------
 */
async function pushUpsert(table: string, row: Record<string, unknown>) {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(table).upsert(row);
    if (error) console.error(`[Supabase] Error guardando en ${table}:`, error.message);
  } catch (e) {
    console.error(`[Supabase] Error guardando en ${table}:`, e);
  }
}

async function pushInsert(table: string, row: Record<string, unknown>) {
  if (!isSupabaseConfigured()) return;
  try {
    // INSERT simple (sin upsert): los visitantes anónimos solo tienen permiso de insertar
    const { error } = await supabase.from(table).insert(row);
    if (error) console.error(`[Supabase] Error insertando en ${table}:`, error.message);
  } catch (e) {
    console.error(`[Supabase] Error insertando en ${table}:`, e);
  }
}

async function pushDelete(table: string, column: string, value: string) {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(table).delete().eq(column, value);
    if (error) console.error(`[Supabase] Error eliminando de ${table}:`, error.message);
  } catch (e) {
    console.error(`[Supabase] Error eliminando de ${table}:`, e);
  }
}

async function fetchDataColumn<T>(table: string): Promise<T[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase.from(table).select('data');
    if (error) {
      console.error(`[Supabase] Error leyendo ${table}:`, error.message);
      return [];
    }
    return (data || []).map((row: { data: T }) => row.data);
  } catch (e) {
    console.error(`[Supabase] Error leyendo ${table}:`, e);
    return [];
  }
}

let isSyncing = false;

/**
 * Trae el estado más reciente de Supabase y lo vuelca sobre localStorage,
 * notificando a todos los componentes montados para que se re-rendericen.
 */
export async function refreshFromSupabase(): Promise<void> {
  if (typeof window === 'undefined' || !isSupabaseConfigured() || isSyncing) return;
  isSyncing = true;
  try {
    const [configRows, sessions, portfolio, bookings, schedule, availabilityRows] = await Promise.all([
      fetchDataColumn<FlashbackConfig>(SUPABASE_TABLES.CONFIG),
      fetchDataColumn<SessionDetail>(SUPABASE_TABLES.SESSIONS),
      fetchDataColumn<PortfolioItem>(SUPABASE_TABLES.PORTFOLIO),
      fetchDataColumn<BookingRequest>(SUPABASE_TABLES.BOOKINGS),
      fetchDataColumn<DaySchedule>(SUPABASE_TABLES.SCHEDULE),
      fetchDataColumn<DayAvailability>(SUPABASE_TABLES.AVAILABILITY),
    ]);

    if (configRows.length) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(configRows[0]));
    }
    if (sessions.length) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
    if (portfolio.length) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
    }
    if (bookings.length) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }
    if (schedule.length) {
      const sorted = [...schedule].sort(
        (a, b) => SCHEDULE_ORDER.indexOf(a.dayOfWeek) - SCHEDULE_ORDER.indexOf(b.dayOfWeek)
      );
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(sorted));
    }
    if (availabilityRows.length) {
      const existing = (() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      })();
      const map: Record<string, DayAvailability> = { ...existing };
      availabilityRows.forEach((day) => {
        map[day.date] = day;
      });
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(map));
    }

    notifyStoreUpdated();
  } finally {
    isSyncing = false;
  }
}

let realtimeInitialized = false;

function setupRealtimeSync() {
  if (typeof window === 'undefined' || !isSupabaseConfigured() || realtimeInitialized) return;
  realtimeInitialized = true;

  try {
    const tables = Object.values(SUPABASE_TABLES);
    let channel = supabase.channel('flashback-sync');
    tables.forEach((table) => {
      channel = channel.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table },
        () => {
          refreshFromSupabase();
        }
      );
    });
    channel.subscribe();
  } catch (e) {
    console.error('[Supabase] No se pudo iniciar la sincronización en tiempo real:', e);
  }
}

// Arranca la sincronización apenas se carga la app (una sola vez)
if (typeof window !== 'undefined') {
  refreshFromSupabase();
  setupRealtimeSync();
}

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
  pushUpsert(SUPABASE_TABLES.AVAILABILITY, { date: dateStr, data: updatedDay });

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
  pushUpsert(SUPABASE_TABLES.AVAILABILITY, { date: dateStr, data: updatedDay });

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
  pushUpsert(SUPABASE_TABLES.CONFIG, { id: 1, data: updated });
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
  schedule.forEach((day) => {
    pushUpsert(SUPABASE_TABLES.SCHEDULE, { day_of_week: day.dayOfWeek, data: day });
  });
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
  pushUpsert(SUPABASE_TABLES.SESSIONS, { id: session.id, data: session });
  return session;
}

export function updateSession(id: string, partial: Partial<SessionDetail>): SessionDetail | null {
  const list = getSessionsList();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...partial };
  saveSessionsList(list);
  pushUpsert(SUPABASE_TABLES.SESSIONS, { id, data: list[index] });
  return list[index];
}

export function deleteSession(id: string): boolean {
  const list = getSessionsList();
  const filtered = list.filter((s) => s.id !== id);
  saveSessionsList(filtered);
  pushDelete(SUPABASE_TABLES.SESSIONS, 'id', id);
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
  pushUpsert(SUPABASE_TABLES.PORTFOLIO, { id: item.id, data: item });
  return item;
}

export function updatePortfolioItem(id: string, partial: Partial<PortfolioItem>): PortfolioItem | null {
  const list = getPortfolioList();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...partial };
  savePortfolioList(list);
  pushUpsert(SUPABASE_TABLES.PORTFOLIO, { id, data: list[index] });
  return list[index];
}

export function deletePortfolioItem(id: string): boolean {
  const list = getPortfolioList();
  const filtered = list.filter((p) => p.id !== id);
  savePortfolioList(filtered);
  pushDelete(SUPABASE_TABLES.PORTFOLIO, 'id', id);
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

export async function submitBookingRequest(
  request: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>
): Promise<BookingRequest> {
  const current = getBookingRequests();
  const newBooking: BookingRequest = {
    ...request,
    id: `fb-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'pendiente',
  };

  const updated = [newBooking, ...current];
  saveBookingRequests(updated);
  // Esperamos a que la escritura llegue a Supabase ANTES de continuar,
  // para que una navegación inmediata (ej. abrir WhatsApp en el celular)
  // no corte la petición a mitad de camino.
  await pushInsert(SUPABASE_TABLES.BOOKINGS, { id: newBooking.id, data: newBooking });
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
  pushUpsert(SUPABASE_TABLES.BOOKINGS, { id, data: list[index] });

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
