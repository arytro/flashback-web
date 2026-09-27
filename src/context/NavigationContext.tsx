import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NavigationContextType {
  currentPath: string;
  isAdmin: boolean;
  isAdminLogin: boolean;
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPath: '/',
  isAdmin: false,
  isAdminLogin: false,
  navigate: () => {},
});

const normalizePath = (path: string, hash: string): string => {
  if (path.startsWith('/admin/login') || hash === '#/admin/login' || hash === '#admin/login') {
    return '/admin/login';
  }
  if (path.startsWith('/admin') || hash === '#/admin' || hash === '#admin') {
    return '/admin';
  }
  return path || '/';
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    return normalizePath(window.location.pathname, window.location.hash);
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      const normalized = normalizePath(window.location.pathname, window.location.hash);
      setCurrentPath(normalized);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.history.pushState({}, '', path);
    } catch {
      // fallback to hash
      window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
    }
    const normalized = normalizePath(path, '');
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = currentPath.startsWith('/admin');
  const isAdminLogin = currentPath === '/admin/login';

  return (
    <NavigationContext.Provider value={{ currentPath, isAdmin, isAdminLogin, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
