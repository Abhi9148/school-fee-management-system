import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatMoney, invoiceBalance } from "@/lib/format";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";

export default async function ParentPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ admissionNo?: string; contact?: string }>;
}) {
  const { admissionNo, contact } = await searchParams;

  let student = null;
  if (admissionNo && contact) {
    student = await prisma.student.findFirst({
      where: { admissionNo: admissionNo.trim(), parentContact: contact.trim() },
      include: {
        class: true,
        invoices: {
          include: { feeStructure: { include: { feeHeads: true } }, payments: { orderBy: { paymentDate: "desc" } } },
          orderBy: { dueDate: "desc" },
        },
      },
    });
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Parent Portal</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your child's admission number and your registered contact number.</p>
        {admissionNo && contact ? (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">No matching student found.</p>
        ) : null}
        <form action="/parent-portal" className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Admission No</span>
            <input name="admissionNo" required placeholder="e.g. ADM1000" className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Parent Contact</span>
            <input name="contact" required placeholder="e.g. 9876511001" className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            View Fee Details
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm text-slate-500 underline">← Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/parent-portal" className="text-sm text-slate-600 underline">← Logout</Link>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-semibold tracking-tight">{student.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{student.class.name} · Admission No {student.admissionNo}</p>
      </div>
      <div>
        <h2 className="text-lg font-medium text-slate-900">Invoices ({student.invoices.length})</h2>
        <div className="mt-3 space-y-4">
          {student.invoices.map((invoice) => {
            const balance = invoiceBalance(invoice);
            return (
              <div key={invoice.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{invoice.feeStructure.term}</p>
                    <p className="text-sm text-slate-500">Due {formatDate(invoice.dueDate)}</p>
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <table className="mt-4 w-full text-left text-sm">
                  <tbody>
                    {invoice.feeStructure.feeHeads.map((head) => (
                      <tr key={head.id} className="border-b border-slate-100">
                        <td className="py-1.5">{head.name}</td>
                        <td className="py-1.5 text-right">{formatMoney(head.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium"><td className="py-1.5">Paid</td><td className="py-1.5 text-right">{formatMoney(invoice.amountPaid)}</td></tr>
                    <tr className="font-semibold"><td className="py-1.5">Balance</td><td className="py-1.5 text-right">{formatMoney(balance)}</td></tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}