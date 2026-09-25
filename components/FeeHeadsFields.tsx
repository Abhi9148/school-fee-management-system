"use client";

import { useState } from "react";

export function FeeHeadsFields() {
  const [rows, setRows] = useState([{ id: 1 }]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Fee heads</p>
      {rows.map((row) => (
        <div key={row.id} className="flex gap-2">
          <input
            name="headName"
            required
            placeholder="e.g. Tuition Fee"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="headAmount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Amount"
            className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { id: Date.now() }])}
        className="text-sm font-medium text-slate-700 underline"
      >
        + Add another fee head
      </button>
    </div>
  );
}
