import React from 'react';

export default function EmptyStateCard({ isParentMode, onNavigateToSymptoms }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
      <h3 className="text-base font-semibold text-slate-700 mb-2">Még nincs elérhető tünet</h3>
      <p className="text-sm text-slate-500 mb-3">
        {isParentMode
          ? "Adj hozzá tüneteket, hogy a család gyorsan rögzíthesse a bejegyzéseket."
          : "Kérd meg a szülőt, hogy adjon hozzá tüneteket a szülői felületen."}
      </p>
      {isParentMode && onNavigateToSymptoms && (
        <button
          type="button"
          onClick={onNavigateToSymptoms}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          ➕ Új tünet felvétele
        </button>
      )}
    </div>
  );
}
