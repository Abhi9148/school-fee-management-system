import type { InvoiceStatus, StudentStatus } from "@prisma/client";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    UNPAID: "bg-red-100 text-red-800",
    OVERDUE: "bg-red-100 text-red-800",
    PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const styles: Record<StudentStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
