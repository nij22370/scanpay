"use client";

import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import QRCodeLib from "qrcode";

interface QRDisplayProps {
  value: string;
  size?: number;
}

export function QRDisplay({ value, size = 200 }: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    QRCodeLib.toDataURL(value, { width: size })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-2"
    >
      {dataUrl ? (
        <img src={dataUrl} alt="QR Code" width={size} height={size} />
      ) : (
        <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded" />
      )}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <QrCode className="w-4 h-4" />
        <span>Scan to pay</span>
      </div>
    </motion.div>
  );
}