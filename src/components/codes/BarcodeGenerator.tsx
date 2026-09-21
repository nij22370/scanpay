"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import bwipjs from "bwip-js";
import { cn } from "@/lib/utils";

const DOWNLOAD_FILENAME_PREFIX = "barcode";
const EAN13_DIGIT_COUNT = 12;
const BARCODE_SCALE = 2;

type BarcodeType = "ean13" | "code128" | "datamatrix";

const BCID_MAP: Record<BarcodeType, string> = {
  ean13: "ean13",
  code128: "code128",
  datamatrix: "datamatrix",
} as const;

interface BarcodeGeneratorProps {
  data: string;
  type: BarcodeType;
  label?: string;
  className?: string;
  hideDownload?: boolean;
}

function validateBarcodeInput(
  data: string,
  type: BarcodeType
): string | null {
  if (!data) {
    return "Barcode data is required.";
  }

  if (type === "ean13") {
    const isValidEan13 = /^\d+$/.test(data) && data.length === EAN13_DIGIT_COUNT;
    if (!isValidEan13) {
      return `EAN-13 requires exactly ${EAN13_DIGIT_COUNT} digits (check digit is auto-calculated).`;
    }
  }

  return null;
}

export function BarcodeGenerator({
  data,
  type,
  label,
  className,
  hideDownload = false,
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const validationError = validateBarcodeInput(data, type);
    if (validationError) {
      setRenderError(validationError);
      return;
    }

    setRenderError(null);

    try {
      bwipjs.toCanvas(canvas, {
        bcid: BCID_MAP[type],
        text: data,
        scale: BARCODE_SCALE,
        includetext: type !== "datamatrix",
        textxalign: "center",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to render barcode.";
      setRenderError(errorMessage);
    }
  }, [data, type]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${DOWNLOAD_FILENAME_PREFIX}-${type}-${Date.now()}.png`;
    anchor.click();
  }, [type]);

  const hasValidationError = validateBarcodeInput(data, type) !== null;
  const hasError = renderError !== null || hasValidationError;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
        "w-full md:w-[300px]",
        className
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

      {!hideDownload && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={hasError}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer w-full",
            "bg-primary text-white hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span className="material-symbols-outlined text-base">download</span>
          <span>Download PNG</span>
        </button>
      )}
    </div>
  );
}

