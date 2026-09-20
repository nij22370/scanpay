"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { readBarcodes } from "zxing-wasm/reader";
import { cn } from "@/lib/utils";

const SCAN_INTERVAL_MS = 300;
const BEEP_FREQUENCY_HZ = 880;
const BEEP_DURATION_MS = 80;
const OVERLAY_SIZE_PX = 240;
const CORNER_BRACKET_SIZE_PX = 24;
const CORNER_BRACKET_THICKNESS_PX = 3;

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  active: boolean;
}

function playSuccessBeep(): void {
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(BEEP_FREQUENCY_HZ, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + BEEP_DURATION_MS / 1000
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + BEEP_DURATION_MS / 1000);

    oscillator.onended = () => {
      audioContext.close();
    };
  } catch {
    // Web Audio API not available — silently skip
  }
}

export function BarcodeScanner({
  onScan,
  onError,
  active,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const scanActiveRef = useRef(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isManualEntryMode, setIsManualEntryMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Camera lifecycle: start/stop based on `active` and not in manual mode
  useEffect(() => {
    if (!active || isManualEntryMode) {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function startCamera(): Promise<void> {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        setCameraError(null);

        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.srcObject = mediaStream;
          await videoElement.play();
        }
      } catch (error: unknown) {
        if (!isMounted) return;

        const errorMessage =
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access in your browser settings."
            : "Unable to access camera. Please check your device.";

        setCameraError(errorMessage);
        onErrorRef.current?.(errorMessage);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [active, isManualEntryMode]);

  // Scanning loop
  useEffect(() => {
    if (!active || isManualEntryMode || cameraError) {
      scanActiveRef.current = false;
      return;
    }

    scanActiveRef.current = true;

    async function scanLoop(): Promise<void> {
      while (scanActiveRef.current) {
        const videoElement = videoRef.current;
        if (!videoElement || videoElement.readyState < 2) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, SCAN_INTERVAL_MS)
          );
          continue;
        }

        const canvas =
          canvasRef.current ?? document.createElement("canvas");
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, SCAN_INTERVAL_MS)
          );
          continue;
        }

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          const results = await readBarcodes(imageData, {
            tryHarder: true,
            maxNumberOfSymbols: 1,
          });

          for (const result of results) {
            if (scanActiveRef.current && result.text) {
              scanActiveRef.current = false;
              playSuccessBeep();
              onScanRef.current(result.text);
              return;
            }
          }
        } catch {
          // Decode errors are expected during continuous scanning
        }

        await new Promise<void>((resolve) =>
          setTimeout(resolve, SCAN_INTERVAL_MS)
        );
      }
    }

    scanLoop();

    return () => {
      scanActiveRef.current = false;
    };
  }, [active, isManualEntryMode, cameraError]);

  const stopCamera = useCallback(() => {
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleToggleManualEntry = useCallback(() => {
    setIsManualEntryMode((previous) => !previous);
    setManualInput("");
    setCameraError(null);
  }, []);

  const handleManualInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setManualInput(event.target.value);
    },
    []
  );

  const handleManualSubmit = useCallback(() => {
    const trimmedValue = manualInput.trim();
    if (trimmedValue) {
      playSuccessBeep();
      onScanRef.current(trimmedValue);
      setManualInput("");
    }
  }, [manualInput]);

  const handleManualKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleManualSubmit();
      }
    },
    [handleManualSubmit]
  );

  // Auto-focus manual input when switching to manual mode
  useEffect(() => {
    if (isManualEntryMode && manualInputRef.current) {
      manualInputRef.current.focus();
    }
  }, [isManualEntryMode]);

  if (!active) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mode Toggle */}
      <button
        type="button"
        onClick={handleToggleManualEntry}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
          "border border-slate-200 text-slate-600 hover:bg-slate-50"
        )}
      >
        <span className="material-symbols-outlined text-base">
          {isManualEntryMode ? "photo_camera" : "keyboard"}
        </span>
        <span>
          {isManualEntryMode ? "Use camera" : "Type manually"}
        </span>
      </button>

      {/* Manual Entry Mode */}
      {isManualEntryMode && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              ref={manualInputRef}
              type="text"
              value={manualInput}
              onChange={handleManualInputChange}
              onKeyDown={handleManualKeyDown}
              placeholder="Enter barcode or QR data…"
              className={cn(
                "flex-1 h-12 rounded-xl border border-input bg-background px-4 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            />
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className={cn(
                "flex items-center justify-center rounded-xl px-4 h-12 text-sm font-medium transition-colors cursor-pointer",
                "bg-primary text-white hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <span className="material-symbols-outlined text-base">
                send
              </span>
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Press Enter to submit
          </p>
        </div>
      )}

      {/* Camera Mode */}
      {!isManualEntryMode && (
        <>
          {cameraError ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-red-400">
                videocam_off
              </span>
              <div>
                <p className="text-sm font-medium text-red-700">
                  {cameraError}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Use &quot;Type manually&quot; as a fallback
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                className="w-full rounded-xl"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="relative"
                  style={{
                    width: OVERLAY_SIZE_PX,
                    height: OVERLAY_SIZE_PX,
                  }}
                >
                  {/* Top-left corner */}
                  <div
                    className="absolute top-0 left-0"
                    style={{
                      width: CORNER_BRACKET_SIZE_PX,
                      height: CORNER_BRACKET_SIZE_PX,
                      borderTop: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderLeft: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderTopLeftRadius: 4,
                    }}
                  />
                  {/* Top-right corner */}
                  <div
                    className="absolute top-0 right-0"
                    style={{
                      width: CORNER_BRACKET_SIZE_PX,
                      height: CORNER_BRACKET_SIZE_PX,
                      borderTop: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderRight: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderTopRightRadius: 4,
                    }}
                  />
                  {/* Bottom-left corner */}
                  <div
                    className="absolute bottom-0 left-0"
                    style={{
                      width: CORNER_BRACKET_SIZE_PX,
                      height: CORNER_BRACKET_SIZE_PX,
                      borderBottom: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderLeft: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderBottomLeftRadius: 4,
                    }}
                  />
                  {/* Bottom-right corner */}
                  <div
                    className="absolute bottom-0 right-0"
                    style={{
                      width: CORNER_BRACKET_SIZE_PX,
                      height: CORNER_BRACKET_SIZE_PX,
                      borderBottom: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderRight: `${CORNER_BRACKET_THICKNESS_PX}px solid white`,
                      borderBottomRightRadius: 4,
                    }}
                  />
                </div>
              </div>

              {/* Scanning label */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white font-medium">
                  <span className="material-symbols-outlined text-sm animate-pulse">
                    center_focus_strong
                  </span>
                  Scanning…
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
