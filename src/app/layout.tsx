import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AI } from './action';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <AI>{children}</AI>
        </body>
      </html>
    </ClerkProvider>
  );
}
