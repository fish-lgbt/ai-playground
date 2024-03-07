import { joinBeta } from '@/app/actions/join-beta';
import { leaveBeta } from '@/app/actions/leave-beta';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ReactNode } from 'react';

const Notice = ({ children, label }: { children: ReactNode; label: string }) => {
  return (
    <div id="dropdown-cta" className="p-4 mt-6 rounded-lg bg-blue-50 dark:bg-blue-900" role="alert">
      <div className="flex items-center mb-3">
        {label && (
          <span className="bg-orange-100 text-orange-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900">
            {label}
          </span>
        )}
        <button
          type="button"
          className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 inline-flex justify-center items-center w-6 h-6 text-blue-900 rounded-lg focus:ring-2 focus:ring-blue-400 p-1 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800"
          data-dismiss-target="#dropdown-cta"
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
};

const SidebarLink = ({ href, title }: { href: string; title: string }) => {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-[#111111] group"
      >
        <span className="ms-3">{title}</span>
      </Link>
    </li>
  );
};

type Link = {
  title: string;
  href: string;
};

const links: Link[] = [
  { title: 'Chat', href: '/' },
  {
    title: 'Images',
    href: '/images',
  },
  {
    title: 'Privacy Policy',
    href: '/privacy-policy',
  },
  {
    title: 'Delete Account',
    href: '/delete-account',
  },
  {
    title: 'Support',
    href: 'https://x.com/imlunahey',
  },
];

export const Sidebar = ({ open }: { open: boolean }) => {
  const { user } = useUser();

  if (!open) return null;

  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 translate-x-0 dark:bg-[#181818] dark:border-[#3e3e3e]"
      aria-label="Sidebar"
    >
      <div className="flex flex-col h-full px-3 pb-4 overflow-y-auto justify-between">
        <ul className="space-y-2 font-medium">
          {links.map((link) => (
            <SidebarLink key={link.href} href={link.href} title={link.title} />
          ))}
        </ul>
        <Notice label="beta">
          <div>
            <p className="mb-3 text-sm text-blue-800 dark:text-blue-400">
              {user?.publicMetadata.features?.includes('beta')
                ? 'You are in the beta program.'
                : 'Join the beta program to get early access to new features and increased ratelimits.'}
            </p>
            <button
              className="text-sm text-blue-800 underline font-medium hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={async () => {
                if (user?.publicMetadata.features?.includes('beta')) {
                  await leaveBeta();
                } else {
                  await joinBeta();
                }

                await user?.reload();
              }}
            >
              {user?.publicMetadata.features?.includes('beta') ? 'Leave' : 'Join'} the beta
            </button>
          </div>
        </Notice>
      </div>
    </aside>
  );
};
