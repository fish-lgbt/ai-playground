'use client';
import { useState } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { cn } from '@/cn';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Navbar
        onToggleSidebar={() => {
          setSidebarOpen(!sidebarOpen);
        }}
      />
      <div className="flex flex-row gap-2 w-full h-full">
        <Sidebar open={sidebarOpen} />
        <div className="mt-16 h-[100dvh-64px] w-full">
          <div className={cn('h-full', sidebarOpen ? 'ml-64 w-[100%-255px]' : 'w-full')}>{children}</div>
        </div>
      </div>
    </>
  );
};
