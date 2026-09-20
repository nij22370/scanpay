"use client";

import { useEffect, useRef } from "react";
import bwipjs from "bwip-js";

const BARCODE_MODULE_WIDTH = 2;
const BARCODE_MODULE_HEIGHT = 12;
const BARCODE_SCALE = 3;
const BARCODE_MAX_WIDTH_PX = 280;

interface BarcodeDisplayProps {
  data: string;
  type?: "upca" | "code128" | "qrcode" | "datamatrix";
}

export function BarcodeDisplay({
  data,
  type = "code128",
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: type,
        text: data,
        scale: BARCODE_SCALE,
        width: BARCODE_MODULE_WIDTH,
        height: BARCODE_MODULE_HEIGHT,
        includetext: true,
        textxalign: "center",
      });
    } catch {
      // Silently handle invalid barcode data
    }
  }, [data, type]);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto"
      style={{ maxWidth: `${BARCODE_MAX_WIDTH_PX}px`, height: "auto" }}
    />
  );
}
