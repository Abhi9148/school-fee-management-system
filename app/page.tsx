import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const latestStructure = await prisma.feeStructure.findFirst({
    orderBy: { createdAt: "desc" },
    select: { term: true },
  });

  const term = latestStructure?.term;
  const now = new Date();

  const [totalStudents, collectedAgg, totalOutstanding, overdueCount] =
    await Promise.all([
      prisma.student.count(),
      prisma.invoice.aggregate({
        _sum: { amountPaid: true },
        where: term ? { feeStructure: { term } } : undefined,
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
    ]);

  const outstanding = totalOutstanding.reduce(
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
      label: term ? `Total Collected (${term})` : "Total Collected this term",
      value: formatMoney(collectedAgg._sum.amountPaid ?? 0),
    },
    { label: "Total Outstanding", value: formatMoney(outstanding) },
    { label: "Overdue Invoices", value: String(overdueCount) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Overview of students, collections, and outstanding fees.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
