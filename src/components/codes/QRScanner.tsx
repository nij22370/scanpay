"use client";

import { useEffect, useRef, useState } from "react";
import { readBarcodes } from "zxing-wasm";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onScanRef = useRef(onScan);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!active) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch {
        if (active) setError("Camera access denied");
      }
    }

    startCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return;
    let active = true;

    async function scanLoop() {
      const v = videoRef.current;
      if (!v) return;
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvas.width = v.videoWidth || 640;
      canvas.height = v.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      while (active && v.readyState >= 2) {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        try {
          const result = await readBarcodes(imageData, { tryRotate: true });
          for (const barcode of result) {
            if (active && barcode.text) {
              onScanRef.current(barcode.text);
              return;
            }
          }
        } catch {
          // ignore scan errors during the loop
        }
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    scanLoop();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full rounded-lg" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}