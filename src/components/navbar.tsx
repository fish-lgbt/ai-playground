import { UserButton } from '@clerk/nextjs';
import { Logo } from './icons/logo';
import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */
export const Navbar = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
  <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-[#181818] dark:border-[#3e3e3e]">
    <div className="px-3 py-3 lg:px-5 lg:pl-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start rtl:justify-end">
          <button
            data-drawer-target="logo-sidebar"
            data-drawer-toggle="logo-sidebar"
            aria-controls="logo-sidebar"
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-[#111111] dark:focus:ring-gray-600"
            onClick={() => {
              onToggleSidebar();
            }}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>
          <Link className="flex ms-2 md:me-24" href="/">
            <Logo />
            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Gay fish</span>
          </Link>
        </div>
        <div className="flex items-center">
          <div className="flex items-center ms-3">
            <div>
              <UserButton showName />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
);
