import React from "react";
import SectionTitle from "../shared/SectionTitle";
import EntriesSection from "../entries/EntriesSection";
import QuickActionsCard from "../shared/QuickActionsCard";
import EmptyStateCard from "../shared/EmptyStateCard";
import QuickStartCard from "../shared/QuickStartCard";

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
          {symptoms.map((s) => {
            // If name is long (>12 chars), make button span full width
            const isLongName = s.name.length > 12;
            return (
              <button
                key={s.id}
                onClick={() => onLog(s)}
                className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex items-center gap-3 active:scale-[0.98] transition hover:border-theme hover:bg-theme-light ${
                  isLongName ? 'col-span-2' : ''
                }`}
              >
                <span className="text-3xl flex-shrink-0" aria-hidden>{s.emoji}</span>
                <span className="text-lg font-medium break-words">{s.name}</span>
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
