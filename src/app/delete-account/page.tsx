import Link from 'next/link';

export default function DeleteAccount() {
  return (
    <div className="flex flex-col p-2 w-full h-full justify-center items-center">
      <div className="w-1/2 gap-2 flex flex-col">
        <h1 className="text-3xl">Delete account</h1>
        <p>
          Are you sure you want to delete your account? This action is irreversible and will delete all your data. You will
          not be able to signup again with the same email address or social accounts for 90 days. If you are sure, please
          contact us{' '}
          <Link href="https://x.com/imlunahey" className="hover:underline">
            here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
