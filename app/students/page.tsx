import { StudentStatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { createStudent } from "./actions";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string }>;
}) {
  const { q, classId } = await searchParams;

  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      where: {
        AND: [
          classId ? { classId } : {},
          q
            ? {
                OR: [
                  { name: { contains: q } },
                  { admissionNo: { contains: q } },
                ],
              }
            : {},
        ],
      },
      include: { class: true },
      orderBy: { admissionNo: "asc" },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-slate-500">All enrolled students.</p>
      </div>

      <form
        action={createStudent}
        className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <p className="sm:col-span-2 lg:col-span-3 text-sm font-medium text-slate-700">
          Add student
        </p>
        <input
          name="name"
          required
          placeholder="Student name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="admissionNo"
          required
          placeholder="Admission no"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
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
          name="parentName"
          required
          placeholder="Parent name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="parentContact"
          required
          placeholder="Parent contact"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add Student
        </button>
      </form>

      <form
        action="/students"
        className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or admission no"
          className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          name="classId"
          defaultValue={classId ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Filter
        </button>
        {(q || classId) && (
          <a href="/students" className="text-sm text-slate-500 underline">
            Clear
          </a>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Admission No</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Parent Name</th>
              <th className="px-4 py-3 font-medium">Parent Contact</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3">{student.admissionNo}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.class.name}</td>
                  <td className="px-4 py-3">{student.parentName}</td>
                  <td className="px-4 py-3">{student.parentContact}</td>
                  <td className="px-4 py-3">
                    <StudentStatusBadge status={student.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}