interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="w-[280px] h-[580px] bg-[#1a1a1a] rounded-[32px] border-[3px] border-[#333] overflow-hidden relative flex flex-col shrink-0">
      {/* Status bar */}
      <div className="h-9 flex justify-between items-center px-5 text-white text-xs font-semibold">
        <span>9:41</span>
        <span>100%</span>
      </div>
      {children}
    </div>
  );
}
