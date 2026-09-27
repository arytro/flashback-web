import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getActiveSupabaseCredentials } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  credentialsSource: 'env' | 'storage' | 'none';
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isConfigured: false,
  credentialsSource: 'none',
  signIn: async () => ({ success: false, error: 'Auth not initialized' }),
  signOut: async () => {},
  refreshSession: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();
  const { source } = getActiveSupabaseCredentials();

  // Load current session from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      if (!configured) {
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase auth getSession warning:', error.message);
        }
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Listen to real-time auth changes (sign in, sign out, token refresh)
    if (configured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (isMounted) {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setIsLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [configured]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!configured) {
      return {
        success: false,
        error: 'Las credenciales de Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) no están configuradas.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let friendlyMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Credenciales inválidas. Comprueba tu correo y contraseña.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'El correo electrónico no ha sido confirmado aún en Supabase.';
        } else if (error.message.includes('Too many requests')) {
          friendlyMessage = 'Demasiados intentos fallidos. Por favor espera un momento e intenta de nuevo.';
        }
        return { success: false, error: friendlyMessage };
      }

      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado al conectar con Supabase';
      return { success: false, error: message };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (configured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error signing out from Supabase:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const refreshSession = async (): Promise<void> => {
    if (!configured) return;
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (err) {
      console.warn('Error refreshing session:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: configured,
        credentialsSource: source,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
