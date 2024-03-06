'use client';
import { ClerkProvider as Clerk } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useEffect, useState } from 'react';

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const onThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(darkMode.matches ? 'dark' : 'light');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onThemeChange);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onThemeChange);
  }, []);

  return (
    <Clerk
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </Clerk>
  );
};
