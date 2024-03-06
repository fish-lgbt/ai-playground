import { cn } from '@/cn';

export const Logo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={cn('w-8 h-8 me-3', className)}>
    <title>Gay fish logo</title>
    <path
      fill="currentColor"
      d="M22 11.71C21.37 9.74 19 6 14.5 6a10.44 10.44 0 00-6.31 2.37 6.64 6.64 0 00-.9-.68 4.62 4.62 0 00-4.84 0 1 1 0 00-.45.82A5.43 5.43 0 003.42 12 5.43 5.43 0 002 15.49a1 1 0 00.45.83 4.6 4.6 0 004.84 0 5.4 5.4 0 00.9-.67A10.44 10.44 0 0014.5 18c4.5 0 6.87-3.74 7.5-5.71a1.14 1.14 0 000-.58z"
    />
  </svg>
);
