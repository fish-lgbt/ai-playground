export const AssistantMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 text-left w-full">
      <div className="text-orange-500">Lottie</div>
      <div className="dark:text-white rounded bg-orange-200 dark:bg-[#cc5500] p-2 w-full break-words">{children}</div>
    </div>
  );
};
