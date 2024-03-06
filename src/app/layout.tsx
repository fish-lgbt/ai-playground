/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AI } from './action';
import { AppShell } from '@/components/app-shell';
import { ClerkProvider } from '@/components/clerk-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gay fish',
  description: 'Ai experiments conducted by the gay fish',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <AI>
            <AppShell>{children}</AppShell>
          </AI>
        </body>
      </html>
    </ClerkProvider>
  );
}
