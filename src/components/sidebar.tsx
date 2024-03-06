import Link from 'next/link';

const Notice = ({ notice, href, hrefText, label }: { notice: string; href: string; hrefText: string; label: string }) => {
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
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
      <p className="mb-3 text-sm text-blue-800 dark:text-blue-400">{notice}</p>
      <Link
        className="text-sm text-blue-800 underline font-medium hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        href={href}
      >
        {hrefText}
      </Link>
    </div>
  );
};

const SidebarLink = ({ href }: { href: string }) => {
  return (
    <li>
      <a
        href={href}
        className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
      >
        <svg
          className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 22 21"
        >
          <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
          <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
        </svg>
        <span className="ms-3">Dashboard</span>
      </a>
    </li>
  );
};

type Link = {
  title: string;
  href: string;
};

const links: Link[] = [];

export const Sidebar = ({ open }: { open: boolean }) => {
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
            <SidebarLink key={link.href} href={link.href} />
          ))}
        </ul>
        <Notice label="beta" href="/beta" hrefText="Enable beta" notice="Join the beta for increased rate limits" />
      </div>
    </aside>
  );
};
