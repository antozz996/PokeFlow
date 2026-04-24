// components/monitor/LiveBadge.tsx

"use client";

export default function LiveBadge() {
  return (
    <div className="bg-brand/20 border border-brand/40 rounded-full px-3 py-1 flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
      </span>
      <span className="text-brand-accent text-xs font-bold tracking-widest">
        LIVE
      </span>
    </div>
  );
}
