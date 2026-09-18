declare module "bwip-js" {
  interface BwipOptions {
    bcid?: string;
    text?: string;
    scale?: number;
    width?: number;
    height?: number;
    [key: string]: unknown;
  }

  function toBuffer(options: BwipOptions): Promise<Buffer>;
  function toCanvas(canvas: HTMLCanvasElement, options: BwipOptions): Promise<void>;
  function request(options: BwipOptions, callback: (err: Error | null, png: Buffer) => void): void;
  function render(options: BwipOptions, canvas: HTMLCanvasElement): void;
  function raw(options: BwipOptions): Promise<Buffer>;
  function fixupOptions(options: BwipOptions): BwipOptions;
  const BWIPJS_VERSION: string;
  const BWIPP_VERSION: string;
}

declare module "nepali-date" {
  export default class NepaliDate {
    constructor(date?: Date | string);
    format(pattern?: string): string;
    static minimum: NepaliDate;
    static maximum: NepaliDate;
  }
}