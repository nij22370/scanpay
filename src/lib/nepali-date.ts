import NepaliDateLib from "nepali-date";

/**
 * Lightweight wrapper around the `nepali-date` package.
 *
 * The published `nepali-date` package exposes a small date-range helper.
 * ScanPay needs a Bikram Sambat (BS) date formatter for receipts, so this
 * wrapper exposes a stable `NepaliDate` class that the rest of the app can
 * import from `@/lib/nepali-date` without depending on the underlying
 * package's internal shape.
 */
export class NepaliDate {
  private date: Date;

  constructor(date: Date | string = new Date()) {
    this.date = date instanceof Date ? date : new Date(date);
  }

  static fromAD(date: Date | string): NepaliDate {
    return new NepaliDate(date);
  }

  format(pattern: string = "YYYY-MM-DD"): string {
    const nd = new NepaliDateLib(this.date.toISOString().slice(0, 10));
    try {
      return nd.format(pattern);
    } catch {
      // Fallback to ISO date when the underlying library cannot parse the
      // value — keeps receipts rendering instead of throwing.
      return this.date.toISOString().slice(0, 10);
    }
  }
}

export default NepaliDate;