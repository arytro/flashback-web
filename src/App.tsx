import React, { useState, useEffect } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PortfolioSection } from './components/PortfolioSection';
import { SessionsSection } from './components/SessionsSection';
import { AboutSection } from './components/AboutSection';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';
import { Footer } from './components/Footer';
import { ProposalBadge } from './components/ProposalBadge';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';

function AppContent() {
  const { currentPath, isAdmin, navigate } = useNavigation();
  const { user, isLoading } = useAuth();
  const [selectedSession, setSelectedSession] = useState<string>('');

  const handleSelectSessionFromCard = (sessionTitle: string) => {
    setSelectedSession(sessionTitle);
  };

  // Route protection effect for /admin and /admin/login
  useEffect(() => {
    if (!isAdmin || isLoading) return;

    if (!user && currentPath === '/admin') {
      // Unauthenticated user trying to access /admin -> redirect to /admin/login
      navigate('/admin/login');
    } else if (user && currentPath === '/admin/login') {
      // Authenticated user at login screen -> redirect to /admin dashboard
      navigate('/admin');
    }
  }, [isAdmin, isLoading, user, currentPath, navigate]);

  // Protected Admin Area handling
  if (isAdmin) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="font-editorial text-2xl tracking-[0.25em] uppercase text-white font-medium">
              FLASHBACK
            </p>
            <p className="text-[10px] text-zinc-500 tracking-[0.2em] font-mono">
              VERIFICANDO SESIÓN...
            </p>
          </div>
        </div>
      );
    }

    // If user is not authenticated with Supabase, render the Login screen
    if (!user) {
      return <AdminLogin />;
    }

    // Authenticated: render the full professional Admin Panel
    return <AdminLayout />;
  }

  // Otherwise, render the artistic monochromatic public website
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      {/* Top Floating Navigation */}
      <Header />

      {/* Main Content Flow:
          1. Hero (Fuerza visual, FLASHBACK, frase corta, CTAs)
          2. Portafolio (Protagonista visual con categorías Retratos, Sesiones, Exterior, Editorial)
          3. Sesiones (Sesiones personales, Retratos, Sesiones al aire libre, Sesiones creativas)
          4. Sobre Flashback (Presentación artística del proyecto)
          5. El Proceso (Flujo de trabajo creativo de 4 pasos)
          6. Disponibilidad (Calendario interactivo, horarios, solicitud de reserva y WhatsApp) */}
      <main className="flex-grow">
        <Hero />
        <PortfolioSection />
        <SessionsSection onSelectSession={handleSelectSessionFromCard} />
        <AboutSection />
        <ExperienceTimeline />
        <AvailabilityCalendar preselectedSession={selectedSession} />
      </main>

      {/* Footer with small discreet link to /admin */}
      <Footer />

      {/* Floating QR info and Admin quick link */}
      <ProposalBadge />
    </div>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationProvider>
  );
}
