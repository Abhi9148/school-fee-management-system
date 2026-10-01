import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const now = new Date();

  const [
    totalStudents,
    collectedAgg,
    outstandingInvoices,
    overdueCount,
    recentPayments,
    allInvoicesForClassSummary,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.invoice.aggregate({
      _sum: { amountPaid: true },
    }),
    prisma.invoice.findMany({
      where: { status: { not: "PAID" } },
      select: {
        totalAmount: true,
        concessionAmount: true,
        lateFeeApplied: true,
        amountPaid: true,
      },
    }),
    prisma.invoice.count({
      where: {
        OR: [
          { status: "OVERDUE" },
          { status: { not: "PAID" }, dueDate: { lt: now } },
        ],
      },
    }),
    prisma.payment.findMany({
      orderBy: { paymentDate: "desc" },
      take: 8,
      include: {
        invoice: {
          include: { student: { include: { class: true } } },
        },
      },
    }),
    prisma.invoice.findMany({
      select: {
        totalAmount: true,
        concessionAmount: true,
        lateFeeApplied: true,
        amountPaid: true,
        student: { select: { class: { select: { id: true, name: true } } } },
      },
    }),
  ]);

  const outstanding = outstandingInvoices.reduce(
    (sum, inv) =>
      sum +
      inv.totalAmount -
      inv.concessionAmount +
      inv.lateFeeApplied -
      inv.amountPaid,
    0
  );

  const cards = [
    { label: "Total Students", value: String(totalStudents) },
    {
      label: "Total Collected",
      value: formatMoney(collectedAgg._sum.amountPaid ?? 0),
    },
    { label: "Total Outstanding", value: formatMoney(outstanding) },
    { label: "Overdue Invoices", value: String(overdueCount) },
  ];

  // Build class-wise summary
  const classMap = new Map<string, { name: string; invoiced: number; collected: number }>();

  for (const inv of allInvoicesForClassSummary) {
    const cls = inv.student.class;
    const payable =
      inv.totalAmount - inv.concessionAmount + inv.lateFeeApplied;
    const existing = classMap.get(cls.id);
    if (existing) {
      existing.invoiced += payable;
      existing.collected += inv.amountPaid;
    } else {
      classMap.set(cls.id, {
        name: cls.name,
        invoiced: payable,
        collected: inv.amountPaid,
      });
    }
  }

  const classSummary = Array.from(classMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Overview of students, collections, and outstanding fees.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex min-h-[140px] flex-col justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <p className="text-base text-slate-500">{card.label}</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {/* Class-wise collection summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Collection by Class
          </h2>
          <div className="mt-4 space-y-4">
            {classSummary.map((cls) => {
              const pct =
                cls.invoiced > 0
                  ? Math.min(100, Math.round((cls.collected / cls.invoiced) * 100))
                  : 0;
              return (
                <div key={cls.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">
                      {cls.name}
                    </span>
                    <span className="text-slate-500">
                      {formatMoney(cls.collected)} / {formatMoney(cls.invoiced)}{" "}
                      ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent payments */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Payments
          </h2>
          {recentPayments.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Student</th>
                  <th className="pb-2 font-medium">Mode</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="pb-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-2">
                      <Link
                        href={`/invoices/${p.invoiceId}`}
                        className="text-slate-800 underline"
                      >
                        {p.invoice.student.name}
                      </Link>
                      <span className="ml-1 text-xs text-slate-400">
                        ({p.invoice.student.class.name})
                      </span>
                    </td>
                    <td className="py-2 text-slate-600">
                      {p.mode.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {formatMoney(p.amount)}
                    </td>
                    <td className="py-2 text-right text-slate-500">
                      {formatDate(p.paymentDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}