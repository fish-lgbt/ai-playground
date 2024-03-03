export const SystemMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 text-left w-full">
      <div className="text-red-500">System</div>
      <div className="bg-[#0a0808] text-white">{children}</div>
    </div>
  );
};
