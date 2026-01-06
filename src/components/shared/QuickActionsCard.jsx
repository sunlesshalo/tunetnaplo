import React from "react";

export default function QuickActionsCard({ onManageSymptoms, onExport }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">⚡ Gyors műveletek</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onManageSymptoms}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-slate-200 hover:border-theme active:scale-[0.98] transition"
        >
          <span className="text-3xl">⚙️</span>
          <span className="text-sm font-medium">Tünetek</span>
        </button>
        <button
          onClick={onExport}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-slate-200 hover:border-theme active:scale-[0.98] transition"
        >
          <span className="text-3xl">📤</span>
          <span className="text-sm font-medium">Export</span>
        </button>
      </div>
    </div>
  );
}
