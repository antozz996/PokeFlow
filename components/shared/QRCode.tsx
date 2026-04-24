// components/shared/QRCode.tsx

"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  className?: string;
}

export default function QRCode({ className }: QRCodeProps) {
  const monitorUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/monitor`;

  return (
    <div className={className}>
      <p className="text-wood-pale/60 text-xs font-body text-center mb-2 tracking-wide">
        Scansiona per seguire il tuo ordine
      </p>
      <QRCodeSVG
        value={monitorUrl}
        size={120}
        bgColor="transparent"
        fgColor="#C8A882"
        level="M"
      />
    </div>
  );
}
