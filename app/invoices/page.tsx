import Link from "next/link";
import type { InvoiceStatus } from "@prisma/client";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney, invoiceBalance } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { generateInvoices } from "./actions";

const STATUSES: InvoiceStatus[] = [
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; status?: string }>;
}) {
  const { classId, status } = await searchParams;

  const [classes, feeStructures, invoices] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.feeStructure.findMany({
      include: { class: true },
      orderBy: [{ class: { name: "asc" } }, { term: "asc" }],
    }),
    prisma.invoice.findMany({
      where: {
        ...(classId ? { student: { classId } } : {}),
        ...(status && STATUSES.includes(status as InvoiceStatus)
          ? { status: status as InvoiceStatus }
          : {}),
      },
      include: {
        student: { include: { class: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">
          All student invoices for generated fee terms.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Class</span>
            <select
              name="classId"
              defaultValue={classId ?? ""}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Status</span>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Filter
          </button>
        </form>

        <form
          action={generateInvoices}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3"
        >
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Generate invoices</span>
            <select
              name="feeStructureId"
              required
              defaultValue=""
              className="min-w-56 rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select fee structure
              </option>
              {feeStructures.map((fs) => (
                <option key={fs.id} value={fs.id}>
                  {fs.class.name} — {fs.term}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Generate Invoices
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Total Amount</th>
              <th className="px-4 py-3 font-medium">Amount Paid</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-slate-900 underline"
                    >
                      {invoice.student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{invoice.student.class.name}</td>
                  <td className="px-4 py-3">
                    {formatMoney(invoice.totalAmount)}
                  </td>
                  <td className="px-4 py-3">{formatMoney(invoice.amountPaid)}</td>
                  <td className="px-4 py-3">
                    {formatMoney(invoiceBalance(invoice))}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3">{formatDate(invoice.dueDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
