import dynamic from "next/dynamic";

export const DynamicBarcodeScanner = dynamic(
  () =>
    import("@/components/pos/BarcodeScanner").then(
      (mod) => mod.BarcodeScanner
    ),
  { ssr: false }
);
