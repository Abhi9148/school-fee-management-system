import { createClass } from "./actions";
import { prisma } from "@/lib/prisma";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
        <p className="mt-1 text-sm text-slate-500">All classes and student counts.</p>
      </div>

      <form
        action={createClass}
        className="flex max-w-xl items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="flex-1 text-sm">
          <span className="mb-1 block font-medium text-slate-700">Add class</span>
          <input
            name="name"
            required
            placeholder="e.g. Grade 9 - A"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add Class
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Students</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={2}>
                  No classes yet.
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">{cls.name}</td>
                  <td className="px-4 py-3">{cls._count.students}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
