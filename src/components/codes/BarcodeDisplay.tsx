"use client";

import { useEffect, useRef } from "react";
import bwipjs from "bwip-js";

interface BarcodeDisplayProps {
  data: string;
  type?: "upca" | "code128" | "qrcode" | "datamatrix";
  width?: number;
  height?: number;
}

export function BarcodeDisplay({
  data,
  type = "code128",
  width = 300,
  height = 100,
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    bwipjs.toCanvas(canvasRef.current, {
      bcid: type,
      text: data,
      scale: 2,
      width,
      height,
    });
  }, [data, type, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="mx-auto"
    />
  );
}
