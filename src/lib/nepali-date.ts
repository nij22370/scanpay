import NepaliDateLib from "nepali-date";

function getNepaliDateInstance(date: Date) {
  try {
    const NepaliDateConstructor =
      // @ts-expect-error - handling CJS/ESM default interop
      NepaliDateLib?.default || NepaliDateLib;
    return new NepaliDateConstructor(date);
  } catch {
    return null;
  }
}

export class NepaliDate {
  private date: Date;

  constructor(date: Date | string = new Date()) {
    this.date = date instanceof Date ? date : new Date(date);
  }

  static fromAD(date: Date | string): NepaliDate {
    return new NepaliDate(date);
  }

  format(pattern: string = "YYYY-MM-DD"): string {
    const instance = getNepaliDateInstance(this.date);
    if (instance && typeof instance.format === "function") {
      try {
        return instance.format(pattern);
      } catch {
        return this.date.toISOString().slice(0, 10);
      }
    }
    return this.date.toISOString().slice(0, 10);
  }
}

export default NepaliDate;

export function convertToBS(date: Date): string {
  const instance = getNepaliDateInstance(date);
  if (instance && typeof instance.format === "function") {
    try {
      return instance.format("YYYY-MM-DD");
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }
  return date.toISOString().slice(0, 10);
}

export function formatToBS(date: Date, pattern: string = "YYYY-MM-DD"): string {
  const instance = getNepaliDateInstance(date);
  if (instance && typeof instance.format === "function") {
    try {
      return instance.format(pattern);
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }
  return date.toISOString().slice(0, 10);
}

export function formatToBSLong(date: Date): string {
  return formatToBS(date, "YYYY MMMM DD");
}
