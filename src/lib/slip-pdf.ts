import jsPDF from "jspdf";
import { formatCurrency } from "@/lib/vat";
import { NepaliDate } from "@/lib/nepali-date";
import type { TransactionWithItems } from "@/types/transaction";

const THERMAL_WIDTH_MM = 80;
const MARGIN_MM = 3;
const CONTENT_WIDTH_MM = THERMAL_WIDTH_MM - MARGIN_MM * 2;

function sanitizeText(text: string): string {
  return text
    .replace(/[^\x00-\x7F\u0900-\u097F]/g, "?")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function wrapText(text: string, maxWidthMm: number, doc: jsPDF, fontSize: number): string[] {
  const lines: string[] = [];
  const words = text.split(" ");
  let currentLine = "";

  doc.setFontSize(fontSize);

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = doc.getTextWidth(testLine);

    if (textWidth > maxWidthMm) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

export function buildSlipPDF(transaction: TransactionWithItems): jsPDF {
  const doc = new jsPDF({
    unit: "mm",
    format: [THERMAL_WIDTH_MM, 200],
    orientation: "portrait",
  });

  doc.setFont("courier", "normal");
  const formattedBsDate = NepaliDate.fromAD(transaction.created_at).format("YYYY-MM-DD");

  const subtotal = transaction.amount;
  const vat = transaction.tax_amount;
  const discount = transaction.discount_amount;
  const total = transaction.total_amount;
  const discountedSubtotal = subtotal - discount;

  let y = 4;

  const centerText = (text: string, fontStyle: "normal" | "bold" = "normal", fontSize = 10, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFont("courier", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const textWidth = doc.getTextWidth(text);
    const x = (THERMAL_WIDTH_MM - textWidth) / 2;
    doc.text(text, x, y);
  };

  const leftText = (text: string, fontStyle: "normal" | "bold" = "normal", fontSize = 9) => {
    doc.setFont("courier", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);
    doc.text(sanitizeText(text), MARGIN_MM, y);
  };

  const rightText = (text: string, fontStyle: "normal" | "bold" = "normal", fontSize = 9) => {
    doc.setFont("courier", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);
    const textWidth = doc.getTextWidth(text);
    const x = THERMAL_WIDTH_MM - MARGIN_MM - textWidth;
    doc.text(text, x, y);
  };

  const dashedLine = () => {
    doc.setDrawColor(150, 150, 150);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(MARGIN_MM, y, THERMAL_WIDTH_MM - MARGIN_MM, y);
    doc.setLineDashPattern([], 0);
  };

  const spacer = (mm: number) => {
    y += mm;
  };

  const doubleLine = (left: string, right: string, leftStyle: "normal" | "bold" = "normal", rightStyle: "normal" | "bold" = "normal", fontSize = 9) => {
    leftText(left, leftStyle, fontSize);
    rightText(right, rightStyle, fontSize);
    spacer(5);
  };

  const amountLine = (label: string, value: string, labelStyle: "normal" | "bold" = "normal", valueStyle: "normal" | "bold" = "bold", fontSize = 9) => {
    leftText(label, labelStyle, fontSize);
    rightText(value, valueStyle, fontSize);
    spacer(4.5);
  };

  const isCash = transaction.payment_method === "cash";

  centerText("ScanPay Store", "bold", 13, [20, 120, 80]);
  spacer(1.5);
  centerText("New Road, Kathmandu, Nepal", "normal", 8);
  spacer(1);
  centerText("PAN/VAT: 609823145", "normal", 7);
  spacer(2.5);

  doc.setDrawColor(0, 150, 80);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_MM, y, THERMAL_WIDTH_MM - MARGIN_MM, y);
  spacer(3);

  centerText("PAYMENT SUCCESSFUL", "bold", 10, [20, 120, 80]);
  spacer(4);

  doubleLine("Txn No:", transaction.transaction_number);
  doubleLine("Date (BS):", formattedBsDate);
  doubleLine("Payment:", transaction.payment_provider || transaction.payment_method);
  doubleLine("Cashier:", transaction.created_by.slice(0, 8));
  spacer(1);

  dashedLine();
  spacer(2);

  leftText("ITEMS PURCHASED", "bold", 9);
  spacer(4);

  doc.setFont("courier", "normal");
  doc.setFontSize(8);

  for (const item of transaction.items) {
    const nameLines = wrapText(sanitizeText(item.product_name), CONTENT_WIDTH_MM - 12, doc, 8);
    for (const line of nameLines) {
      leftText(line);
      spacer(3.5);
    }
    const amount = formatCurrency(item.total_price);
    leftText(`x${item.quantity} @ ${formatCurrency(item.unit_price)}`, "normal", 7);
    rightText(amount, "bold", 8);
    spacer(3.5);
  }

  spacer(1);
  dashedLine();
  spacer(2);

  amountLine("Subtotal:", formatCurrency(subtotal));
  if (discount > 0) {
    doc.setTextColor(180, 40, 40);
    amountLine("Discount:", `- ${formatCurrency(discount)}`, "normal", "bold");
    doc.setTextColor(0, 0, 0);
  }
  amountLine("Taxable:", formatCurrency(discountedSubtotal));
  amountLine("VAT (13%):", formatCurrency(vat));
  spacer(1);
  dashedLine();
  spacer(1.5);

  amountLine("GRAND TOTAL:", formatCurrency(total), "bold", "bold", 11);
  spacer(2);

  if (isCash) {
    amountLine("Cash Tendered:", formatCurrency((transaction as any).cash_tendered || total));
    amountLine("Change:", formatCurrency((transaction as any).cash_change || 0), "normal", "bold");
    spacer(1);
    dashedLine();
    spacer(1.5);
  }

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  centerText("Thank you for your visit!", "bold", 8);
  spacer(1.5);
  centerText("Powered by ScanPay Nepal", "normal", 6);

  return doc;
}