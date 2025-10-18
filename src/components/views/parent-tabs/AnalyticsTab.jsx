import React, { useState } from "react";
import PatternsTab from "../../stats/PatternsTab";
import SectionTitle from "../../shared/SectionTitle";

export default function AnalyticsTab({ entries, symptoms, onExport }) {
  return (
    <div className="space-y-6">
      <PatternsTab entries={entries} symptoms={symptoms} />

      {/* Export button for convenience */}
      <div className="pt-4">
        <button
          onClick={onExport}
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 flex items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition"
        >
          <span className="text-3xl">📤</span>
          <div className="text-left flex-1">
            <div className="font-semibold">Exportálás</div>
            <div className="text-sm text-slate-500">CSV vagy PDF formátumban</div>
          </div>
        </button>
      </div>
    </div>
  );
}
