import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-700">
        Thinqloud Campus Hiring · Application Development Assessment
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        School Fee Management System
      </h1>
      <p className="mt-4 max-w-xl text-base text-slate-400">
        Manage classes, fee structures, invoices, and payments — or view your
        child&apos;s fee details as a parent.
      </p>

      <div className="mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
        <Link
          href="/admin-login"
          className="group rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-left transition hover:border-indigo-500 hover:bg-slate-800"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-xl text-indigo-400">
            🛠️
          </div>
          <p className="mt-4 text-lg font-semibold text-white">Admin Login</p>
          <p className="mt-1 text-sm text-slate-400">
            Manage classes, students, fee structures, and payments.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 group-hover:gap-2 transition-all">
            Enter dashboard →
          </span>
        </Link>

        <Link
          href="/parent-portal"
          className="group rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-left transition hover:border-emerald-500 hover:bg-slate-800"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-xl text-emerald-400">
            👪
          </div>
          <p className="mt-4 text-lg font-semibold text-white">Parent Portal</p>
          <p className="mt-1 text-sm text-slate-400">
            View your child&apos;s invoices, dues, and payment history.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 group-hover:gap-2 transition-all">
            View fee details →
          </span>
        </Link>
      </div>

      <p className="mt-12 text-xs text-slate-500">
        Built with Next.js · Prisma · SQLite · Tailwind CSS
      </p>
    </div>
  );
}