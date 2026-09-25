// lib/recordPayment.ts
// Core business process: record a payment against an invoice,
// recalculate balance/status, apply late fee if overdue.

import { PaymentMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LATE_FEE_FLAT = 100; // simple flat late fee; swap for % logic if you want

function generateReceiptNo() {
  return `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function recordPayment(
  invoiceId: string,
  amount: number,
  mode: PaymentMode,
  paymentDate: Date = new Date()
) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Invoice not found");

  // Determine if this payment is late
  const isLate = paymentDate > invoice.dueDate;
  const lateFee = isLate && invoice.lateFeeApplied === 0 ? LATE_FEE_FLAT : 0;

  const receiptNo = generateReceiptNo();

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      mode,
      paymentDate,
      lateFeeApplied: lateFee,
      receiptNo,
    },
  });

  const newAmountPaid = invoice.amountPaid + amount;
  const newLateFeeTotal = invoice.lateFeeApplied + lateFee;
  const payableTotal =
    invoice.totalAmount - invoice.concessionAmount + newLateFeeTotal;

  let newStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" = "UNPAID";
  if (newAmountPaid >= payableTotal) {
    newStatus = "PAID";
  } else if (newAmountPaid > 0) {
    newStatus = isLate ? "OVERDUE" : "PARTIALLY_PAID";
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: newAmountPaid,
      lateFeeApplied: newLateFeeTotal,
      status: newStatus,
    },
  });

  return { payment, invoice: updatedInvoice };
}
