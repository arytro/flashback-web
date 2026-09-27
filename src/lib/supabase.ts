import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'flashback_supabase_url';
const STORAGE_KEY_KEY = 'flashback_supabase_anon_key';

// Helper to validate URL
export const isValidSupabaseUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname.length > 3;
  } catch {
    return false;
  }
};

// Retrieve config from Vite environment variables or session storage
export const getActiveSupabaseCredentials = (): { url: string; anonKey: string; source: 'env' | 'storage' | 'none' } => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (isValidSupabaseUrl(envUrl) && envKey.length > 10) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  // Fallback to storage for live preview testing before environment redeploy
  if (typeof window !== 'undefined') {
    const storedUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
    const storedKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
    if (isValidSupabaseUrl(storedUrl) && storedKey.length > 10) {
      return { url: storedUrl, anonKey: storedKey, source: 'storage' };
    }
  }

  return { url: envUrl, anonKey: envKey, source: 'none' };
};

export const saveSupabaseCredentialsToStorage = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    window.location.reload();
  }
};

export const clearSupabaseCredentialsFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    window.location.reload();
  }
};

// Initialize Supabase Client
let clientInstance: SupabaseClient | null = null;
const creds = getActiveSupabaseCredentials();

if (isValidSupabaseUrl(creds.url) && creds.anonKey) {
  try {
    clientInstance = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
  }
}

// Fallback dummy client if not yet configured, to prevent app crash
export const supabase: SupabaseClient = clientInstance || createClient(
  'https://placeholder.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  const current = getActiveSupabaseCredentials();
  return isValidSupabaseUrl(current.url) && current.anonKey.length > 10;
};
