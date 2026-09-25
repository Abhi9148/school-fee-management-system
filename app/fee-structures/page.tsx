import { FeeHeadsFields } from "@/components/FeeHeadsFields";
import { formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { createFeeStructure } from "./actions";

export default async function FeeStructuresPage() {
  const [classes, feeStructures] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.feeStructure.findMany({
      include: { class: true, feeHeads: true },
      orderBy: [{ class: { name: "asc" } }, { createdAt: "desc" }],
    }),
  ]);

  const grouped = new Map<string, typeof feeStructures>();
  for (const fs of feeStructures) {
    const key = fs.class.name;
    const list = grouped.get(key) ?? [];
    list.push(fs);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fee Structures</h1>
        <p className="mt-1 text-sm text-slate-500">
          Term fees grouped by class.
        </p>
      </div>

      <form
        action={createFeeStructure}
        className="max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-4"
      >
        <p className="text-sm font-medium text-slate-700">Create fee structure</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            name="classId"
            required
            defaultValue=""
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select class
            </option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <input
            name="term"
            required
            placeholder="Term name (e.g. Term 2)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="dueDate"
            type="date"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <FeeHeadsFields />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create fee structure
        </button>
      </form>

      <div className="space-y-6">
        {grouped.size === 0 ? (
          <p className="text-sm text-slate-500">No fee structures yet.</p>
        ) : (
          [...grouped.entries()].map(([className, structures]) => (
            <section key={className}>
              <h2 className="mb-2 text-lg font-medium">{className}</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Term</th>
                      <th className="px-4 py-3 font-medium">Due date</th>
                      <th className="px-4 py-3 font-medium">Total amount</th>
                      <th className="px-4 py-3 font-medium">Fee heads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.map((fs) => (
                      <tr
                        key={fs.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-4 py-3">{fs.term}</td>
                        <td className="px-4 py-3">{formatDate(fs.dueDate)}</td>
                        <td className="px-4 py-3">
                          {formatMoney(
                            fs.feeHeads.reduce((sum, h) => sum + h.amount, 0)
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {fs.feeHeads
                            .map((h) => `${h.name} (${formatMoney(h.amount)})`)
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
