import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney, invoiceBalance } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { submitPayment } from "../actions";
import { PrintButton } from "@/components/PrintButton";

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ receipt?: string }>;
}) {
  const { id } = await params;
  const { receipt } = await searchParams;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: { include: { class: true } },
      feeStructure: { include: { feeHeads: true } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });

  if (!invoice) notFound();

  const balance = invoiceBalance(invoice);
  const receiptPayment = receipt
    ? invoice.payments.find((p) => p.receiptNo === receipt)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
           <Link href="/invoices" className="print:hidden text-sm text-slate-600 underline">
        ← Back to invoices
      </Link>

      {receiptPayment ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-green-800">Payment recorded</p>
              <p className="mt-2 font-mono text-lg font-semibold text-green-900">
                Receipt {receiptPayment.receiptNo}
              </p>
              <p className="mt-1 text-sm text-green-800">
                {formatMoney(receiptPayment.amount)} via {receiptPayment.mode} on{" "}
                {formatDate(receiptPayment.paymentDate)}
              </p>
            </div>
            <PrintButton />
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Invoice</h1>
            <p className="mt-1 text-sm text-slate-500">
              {invoice.feeStructure.term} · due {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <InvoiceStatusBadge status={invoice.status} />
            <PrintButton label="Print Invoice" />
            <a 
  href={`https://wa.me/91${invoice.student.parentContact}?text=${encodeURIComponent(
    `Dear Parent, this is a fee reminder for ${invoice.student.name} — ${invoice.feeStructure.term}. Total: ₹${(
      invoice.totalAmount - invoice.concessionAmount + invoice.lateFeeApplied
    ).toFixed(2)}, Paid: ₹${invoice.amountPaid.toFixed(2)}, Balance: ₹${balance.toFixed(2)}. Please contact the school office for payment.`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="print:hidden rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
>
  Send via WhatsApp
</a>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Student</dt>
            <dd className="font-medium">{invoice.student.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Admission no</dt>
            <dd className="font-medium">{invoice.student.admissionNo}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Class</dt>
            <dd className="font-medium">{invoice.student.class.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Parent</dt>
            <dd className="font-medium">
              {invoice.student.parentName} · {invoice.student.parentContact}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Fee breakdown</h2>
        <table className="mt-3 w-full text-left text-sm">
          <tbody>
            {invoice.feeStructure.feeHeads.map((head) => (
              <tr key={head.id} className="border-b border-slate-100">
                <td className="py-2">{head.name}</td>
                <td className="py-2 text-right">{formatMoney(head.amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2">Concession</td>
              <td className="py-2 text-right">
                - {formatMoney(invoice.concessionAmount)}
              </td>
            </tr>
            <tr>
              <td className="py-2">Late fee</td>
              <td className="py-2 text-right">
                {formatMoney(invoice.lateFeeApplied)}
              </td>
            </tr>
            <tr className="font-medium">
              <td className="py-2">Total</td>
              <td className="py-2 text-right">
                {formatMoney(
                  invoice.totalAmount -
                    invoice.concessionAmount +
                    invoice.lateFeeApplied
                )}
              </td>
            </tr>
            <tr>
              <td className="py-2">Paid</td>
              <td className="py-2 text-right">{formatMoney(invoice.amountPaid)}</td>
            </tr>
            <tr className="font-semibold">
              <td className="py-2">Balance</td>
              <td className="py-2 text-right">{formatMoney(balance)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-medium">Payments</h2>
        {invoice.payments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No payments yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-slate-600">
              <tr>
                <th className="py-2 font-medium">Receipt</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Mode</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{payment.receiptNo}</td>
                  <td className="py-2">{formatDate(payment.paymentDate)}</td>
                  <td className="py-2">{payment.mode.replace(/_/g, " ")}</td>
                  <td className="py-2 text-right">{formatMoney(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {balance > 0 ? (
                <form
                action={submitPayment}
                className="print:hidden space-y-3 rounded-lg border border-slate-200 bg-white p-5"
              >
          <h2 className="text-lg font-medium">Record payment</h2>
          <input type="hidden" name="invoiceId" value={invoice.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Amount</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                max={balance}
                required
                defaultValue={balance}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Payment mode</span>
              <select
                name="mode"
                required
                defaultValue="CASH"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Record Payment
          </button>
        </form>
      ) : (
        <p className="text-sm text-green-700">This invoice is fully paid.</p>
      )}
    </div>
  );
}
