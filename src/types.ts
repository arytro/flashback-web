export type PortfolioCategory = 'todos' | 'retratos' | 'sesiones' | 'exterior' | 'editorial';

export interface PortfolioItem {
  id: string;
  title: string;
  category: PortfolioCategory;
  categoryLabel: string;
  location?: string;
  imageUrl: string;
  aspectRatio?: 'tall' | 'wide' | 'square';
  quote?: string;
  description?: string;
  active?: boolean;
}

export interface SessionDetail {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  duration: string;
  priceNote: string;
  category: string;
  imageUrl: string;
  highlights: string[];
  active?: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  label?: string;
  status: 'available' | 'booked' | 'blocked';
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: 'available' | 'blocked' | 'partially_booked';
  note?: string;
  slots: TimeSlot[];
}

export type BookingStatus = 'pendiente' | 'confirmada' | 'rechazada' | 'cancelada';

export interface BookingRequest {
  id: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sessionType: string;
  selectedDate: string;
  selectedTime: string;
  message?: string;
  status: BookingStatus;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 Sunday, 1 Monday ... 6 Saturday
  dayName: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface FlashbackConfig {
  name: string;
  tagline: string;
  logoUrl?: string;
  instagramHandle: string;
  instagramUrl: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  location: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroTagline: string;
  aboutText: string[];
  formspreeEndpoint?: string;
  weeklySchedule?: DaySchedule[];
}

export type AdminSection =
  | 'dashboard'
  | 'calendario'
  | 'reservas'
  | 'sesiones'
  | 'portafolio'
  | 'informacion'
  | 'horarios'
  | 'configuracion';
