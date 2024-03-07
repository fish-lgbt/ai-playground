export const UserMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 text-left w-full">
      <div className="text-gray-500">You</div>
      <div className="dark:text-white rounded bg-gray-200 dark:bg-[#181818] p-2 w-full break-words">{children}</div>
    </div>
  );
};
