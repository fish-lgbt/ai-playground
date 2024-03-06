export const AssistantMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 text-left w-full">
      <div className="text-orange-500">Assistant</div>
      <div className="dark:text-white">{children}</div>
    </div>
  );
};
