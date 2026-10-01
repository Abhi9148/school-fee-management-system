"use client";

export function PrintButton({ label = "Print Receipt" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100"
    >
      {label}
    </button>
  );
}