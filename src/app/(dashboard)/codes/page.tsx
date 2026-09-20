"use client";

import { useCallback, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";
import { QRGenerator } from "@/components/codes/QRGenerator";
import { BarcodeGenerator } from "@/components/codes/BarcodeGenerator";
import type { CodeType } from "@/types/product";

const TAB_GENERATE = "generate";
const TAB_MY_CODES = "my-codes";

interface CodeTypeOption {
  value: CodeType;
  label: string;
  iconName: string;
}

const CODE_TYPE_OPTIONS: readonly CodeTypeOption[] = [
  { value: "qr", label: "QR Code", iconName: "qr_code_2" },
  { value: "ean13", label: "EAN-13", iconName: "barcode" },
  { value: "code128", label: "Code 128", iconName: "barcode" },
  { value: "datamatrix", label: "DataMatrix", iconName: "grid_on" },
] as const;

const INITIAL_FORM_STATE = {
  selectedCodeType: "qr" as CodeType,
  dataInput: "",
  labelInput: "",
};

export default function CodesPage() {
  const [selectedCodeType, setSelectedCodeType] = useState<CodeType>(
    INITIAL_FORM_STATE.selectedCodeType
  );
  const [dataInput, setDataInput] = useState(INITIAL_FORM_STATE.dataInput);
  const [labelInput, setLabelInput] = useState(INITIAL_FORM_STATE.labelInput);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleCodeTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCodeType(event.target.value as CodeType);
      setIsGenerated(false);
    },
    []
  );

  const handleDataInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDataInput(event.target.value);
      setIsGenerated(false);
    },
    []
  );

  const handleLabelInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLabelInput(event.target.value);
    },
    []
  );

  const handleGenerate = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!dataInput.trim()) return;
      setIsGenerated(true);
    },
    [dataInput]
  );

  const handleReset = useCallback(() => {
    setSelectedCodeType(INITIAL_FORM_STATE.selectedCodeType);
    setDataInput(INITIAL_FORM_STATE.dataInput);
    setLabelInput(INITIAL_FORM_STATE.labelInput);
    setIsGenerated(false);
  }, []);

  const dataInputPlaceholder = useMemo(() => {
    switch (selectedCodeType) {
      case "qr":
        return "https://example.com or any text";
      case "ean13":
        return "123456789012 (12 digits)";
      case "code128":
        return "ABC-12345";
      case "datamatrix":
        return "Any alphanumeric data";
    }
  }, [selectedCodeType]);

  const isQRType = selectedCodeType === "qr";
  const isBarcodeType = !isQRType;
  const isFormValid = dataInput.trim().length > 0;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Code Engine</h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate QR codes and barcodes for products and payments
        </p>
      </div>

      <Tabs defaultValue={TAB_GENERATE}>
        <TabsList className="mb-6">
          <TabsTrigger value={TAB_GENERATE} className="cursor-pointer">
            <span className="material-symbols-outlined text-base">
              add_circle
            </span>
            Generate
          </TabsTrigger>
          <TabsTrigger value={TAB_MY_CODES} className="cursor-pointer">
            <span className="material-symbols-outlined text-base">
              folder_open
            </span>
            My Codes
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value={TAB_GENERATE}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Form Column */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-xl">
                  tune
                </span>
                <h2 className="text-base font-semibold text-slate-900">
                  Configuration
                </h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Code Type Selector */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="code-type-selector"
                    className="text-sm font-medium text-slate-700"
                  >
                    Code Type
                  </label>
                  <div className="relative">
                    <select
                      id="code-type-selector"
                      value={selectedCodeType}
                      onChange={handleCodeTypeChange}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none cursor-pointer",
                        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                    >
                      {CODE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Data Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="code-data-input"
                    className="text-sm font-medium text-slate-700"
                  >
                    Data
                  </label>
                  <input
                    id="code-data-input"
                    type="text"
                    value={dataInput}
                    onChange={handleDataInputChange}
                    placeholder={dataInputPlaceholder}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  />
                </div>

                {/* Label Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="code-label-input"
                    className="text-sm font-medium text-slate-700"
                  >
                    Label{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="code-label-input"
                    type="text"
                    value={labelInput}
                    onChange={handleLabelInputChange}
                    placeholder="e.g. Product SKU, Payment link"
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                      "bg-primary text-white hover:bg-primary/90",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <span className="material-symbols-outlined text-base">
                      qr_code_2
                    </span>
                    Generate
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                      "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span className="material-symbols-outlined text-base">
                      refresh
                    </span>
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Column */}
            <div className="flex flex-col items-center">
              {isGenerated && isQRType && (
                <QRGenerator
                  data={dataInput}
                  label={labelInput || undefined}
                />
              )}
              {isGenerated && isBarcodeType && (
                <BarcodeGenerator
                  data={dataInput}
                  type={selectedCodeType as "ean13" | "code128" | "datamatrix"}
                  label={labelInput || undefined}
                />
              )}
              {!isGenerated && (
                <div className="flex flex-col items-center justify-center w-full md:w-[300px] min-h-[280px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">
                    qr_code_2
                  </span>
                  <p className="text-sm font-medium text-slate-400">
                    Configure and generate a code
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Preview will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* My Codes Tab */}
        <TabsContent value={TAB_MY_CODES}>
          <div className="flex flex-col items-center justify-center min-h-[300px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
              folder_open
            </span>
            <p className="text-base font-medium text-slate-400">
              No saved codes yet
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Generated codes will appear here in a future update
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
