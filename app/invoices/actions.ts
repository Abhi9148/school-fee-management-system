"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PaymentMode } from "@prisma/client";
import { generateInvoicesForClass } from "@/lib/generateInvoices";
import { recordPayment } from "@/lib/recordPayment";

export async function generateInvoices(formData: FormData) {
  const feeStructureId = String(formData.get("feeStructureId") ?? "").trim();
  if (!feeStructureId) return;

  await generateInvoicesForClass(feeStructureId);
  revalidatePath("/invoices");
  revalidatePath("/");
}

export async function submitPayment(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const mode = String(formData.get("mode") ?? "") as PaymentMode;

  if (!invoiceId || !Number.isFinite(amount) || amount <= 0 || !mode) {
    return;
  }

  const result = await recordPayment(invoiceId, amount, mode);
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/");
  redirect(`/invoices/${invoiceId}?receipt=${result.payment.receiptNo}`);
}
