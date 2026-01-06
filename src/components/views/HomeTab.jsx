import React, { useMemo } from "react";
import SectionTitle from "../shared/SectionTitle";
import EntriesSection from "../entries/EntriesSection";
import QuickActionsCard from "../shared/QuickActionsCard";
import EmptyStateCard from "../shared/EmptyStateCard";
import QuickStartCard from "../shared/QuickStartCard";

// Smart grid balancing - dynamically decides if borderline items should be
// half or full width to ensure no gaps (OCD-friendly layout)
function reorderForBalancedGrid(symptoms) {
  const DEFINITELY_SHORT = 13;  // Always half-width (truncates if needed)
  const DEFINITELY_LONG = 20;   // Always full-width
  // 14-19 chars = borderline, can flex either way

  const definiteShort = symptoms.filter(s => s.name.length <= DEFINITELY_SHORT);
  const borderline = symptoms.filter(s => s.name.length > DEFINITELY_SHORT && s.name.length < DEFINITELY_LONG);
  const definiteLong = symptoms.filter(s => s.name.length >= DEFINITELY_LONG);

  // Sort borderline by length (shortest first - they look better as half-width)
  const sortedBorderline = [...borderline].sort((a, b) => a.name.length - b.name.length);

  const short = [...definiteShort];
  const long = [...definiteLong];

  // Distribute borderline items to make short count even (no orphans)
  for (const item of sortedBorderline) {
    if (short.length % 2 === 1) {
      short.push(item);  // Need one more to complete a pair
    } else {
      long.push(item);   // Already even, make it full-width
    }
  }

  // If still odd after all borderlines, move the longest "short" to full-width
  // (better to have slightly empty full-width than a gap)
  if (short.length % 2 === 1 && short.length > 0) {
    // Find the longest short item and move it to long
    const longestIdx = short.reduce((maxIdx, s, idx, arr) =>
      s.name.length > arr[maxIdx].name.length ? idx : maxIdx, 0);
    long.unshift(short.splice(longestIdx, 1)[0]);
  }

  // Build result: pairs of shorts first, then longs
  const result = [];
  for (let i = 0; i < short.length; i += 2) {
    result.push(short[i]);
    if (i + 1 < short.length) result.push(short[i + 1]);
  }
  result.push(...long);

  // Return ordered list + set of IDs that should be full-width
  return {
    ordered: result,
    fullWidthIds: new Set(long.map(s => s.id))
  };
}

export default function HomeTab({
  symptoms,
  onLog,
  entries,
  onEdit,
  onDelete,
  title = "Ma milyen tünet volt?",
  subtitle = "Koppints egy kártyára, majd állítsd be az erősséget.",
  // Optional props for parent mode
  onManageSymptoms,
  onExport,
  isParentMode = false,
  onNavigateToSymptoms,
}) {
  const hasSymptoms = symptoms.length > 0;
  const hasEntries = entries.length > 0;

  // Reorder symptoms for balanced grid layout (no gaps)
  const { ordered: orderedSymptoms, fullWidthIds } = useMemo(
    () => reorderForBalancedGrid(symptoms),
    [symptoms]
  );

  return (
    <div className="space-y-6">
      <SectionTitle title={title} subtitle={subtitle} />

      {!hasSymptoms && (
        <EmptyStateCard
          isParentMode={isParentMode}
          onNavigateToSymptoms={onNavigateToSymptoms}
        />
      )}

      {hasSymptoms && (
        <div className="grid grid-cols-2 gap-3">
          {orderedSymptoms.map((s) => {
            // Dynamic: algorithm decides which items are full-width
            const isFullWidth = fullWidthIds.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onLog(s)}
                className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex items-center gap-3 active:scale-[0.98] transition hover:border-theme hover:bg-theme-light ${
                  isFullWidth ? 'col-span-2' : ''
                }`}
              >
                <span className="text-3xl flex-shrink-0" aria-hidden>{s.emoji}</span>
                <span className={`font-medium ${isFullWidth ? 'text-lg' : 'text-base truncate'}`}>{s.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {!hasEntries && <QuickStartCard isParentMode={isParentMode} />}

      {/* Quick Actions Card (parent mode only) */}
      {isParentMode && onManageSymptoms && onExport && (
        <QuickActionsCard
          onManageSymptoms={onManageSymptoms}
          onExport={onExport}
        />
      )}

      <EntriesSection
        entries={entries}
        symptoms={symptoms}
        title="Összes bejegyzés"
        subtitle="Böngészd a teljes naplót és szűrd az időszakot."
        onEdit={onEdit}
        onDelete={onDelete}
        showDate={true}
        compactButtons={false}
        defaultFilter="7"
        showFilter={true}
        allowLoadMore={true}
        collapsible={true}
        previewCount={5}
        previewTitle="Legutóbbi bejegyzések"
        previewSubtitle="Az utolsó öt rögzítés gyors áttekintése."
        previewFilter="all"
        toggleLabels={{
          expand: "Összes bejegyzés megtekintése",
          collapse: "⟲ Csak az utolsó 5 bejegyzés",
        }}
      />
    </div>
  );
}
