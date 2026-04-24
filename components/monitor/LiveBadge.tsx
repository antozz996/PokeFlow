// components/monitor/LiveBadge.tsx

"use client";

export default function LiveBadge() {
  return (
    <div className="bg-poke/20 border border-poke/40 rounded-full px-3 py-1 flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-poke-light opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-poke-light"></span>
      </span>
      <span className="text-poke-light text-xs font-bold tracking-widest">
        LIVE
      </span>
    </div>
  );
}
