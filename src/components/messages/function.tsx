export const FunctionMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 text-left w-full">
      <div className="text-gray-500">Function</div>
      <div className="bg-[#0a0808] text-white">{children}</div>
    </div>
  );
};
