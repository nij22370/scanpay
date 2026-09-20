"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";
import { cn } from "@/lib/utils";

const DEFAULT_QR_SIZE = 240;
const QR_ERROR_CORRECTION_LEVEL = "M";
const DOWNLOAD_FILENAME_PREFIX = "qr-code";

interface QRGeneratorProps {
  data: string;
  size?: number;
  label?: string;
}

export function QRGenerator({
  data,
  size = DEFAULT_QR_SIZE,
  label,
}: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    setRenderError(null);

    QRCodeLib.toCanvas(
      canvas,
      data,
      {
        width: size,
        errorCorrectionLevel: QR_ERROR_CORRECTION_LEVEL,
        margin: 2,
      },
      (error: Error | null | undefined) => {
        if (error) {
          setRenderError(error.message);
        }
      }
    );
  }, [data, size]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${DOWNLOAD_FILENAME_PREFIX}-${Date.now()}.png`;
    anchor.click();
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
        "w-full md:w-[300px]"
      )}
    >
      {renderError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{renderError}</span>
        </div>
      ) : (
        <canvas ref={canvasRef} className="rounded-lg" />
      )}

      {label && (
        <p className="text-sm font-medium text-slate-600 text-center">
          {label}
        </p>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={!!renderError}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer w-full",
          "bg-primary text-white hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <span className="material-symbols-outlined text-base">download</span>
        <span>Download PNG</span>
      </button>
    </div>
  );
}
