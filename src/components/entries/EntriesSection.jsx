import React, { useState, useEffect, useMemo } from "react";
import EntryCard from "./EntryCard";
import SectionTitle from "../shared/SectionTitle";

const ENTRY_FILTERS = [
  { id: "1", label: "Ma", days: 1 },
  { id: "7", label: "7 nap", days: 7 },
  { id: "30", label: "30 nap", days: 30 },
  { id: "all", label: "Összes" },
];

export default function EntriesSection({
  entries,
  symptoms,
  title,
  subtitle,
  onEdit,
  onDelete,
  showDate = true,
  compactButtons = false,
  defaultFilter = "7",
  showFilter = true,
  allowLoadMore = true,
  collapsible = false,
  previewCount = 5,
  previewTitle = "Legutóbbi bejegyzések",
  previewSubtitle = "Az utolsó bejegyzések gyors áttekintése.",
  previewFilter = "all",
  toggleLabels = {
    expand: "Összes bejegyzés megtekintése",
    collapse: "⟲ Csak az utolsó bejegyzések",
  },
  selectable = false,
  onBulkDelete,
}) {
  const INITIAL_VISIBLE = 30;
  const LOAD_STEP = 30;
  const [expanded, setExpanded] = useState(!collapsible);
  const [filterId, setFilterId] = useState(collapsible ? previewFilter : defaultFilter);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const isPreview = collapsible && !expanded;
  const effectiveShowFilter = !isPreview && showFilter;
  const effectiveAllowLoadMore = !isPreview && allowLoadMore;
  const effectiveDefaultFilter = isPreview ? previewFilter : defaultFilter;

  useEffect(() => {
    setExpanded(!collapsible);
  }, [collapsible]);

  useEffect(() => {
    if (!selectable) {
      setSelectionMode(false);
      setSelectedIds([]);
    }
  }, [selectable]);

  useEffect(() => {
    setFilterId(effectiveDefaultFilter);
  }, [effectiveDefaultFilter]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [filterId, entries.length, expanded]);

  const sourceEntries = useMemo(() => {
    if (!Array.isArray(entries)) return [];
    if (isPreview) {
      return entries.slice(0, previewCount);
    }
    return entries;
  }, [entries, isPreview, previewCount]);

  useEffect(() => {
    if (!selectionMode) {
      return;
    }
    const allowedIds = new Set(sourceEntries.map((entry) => entry.id));
    setSelectedIds((prev) => prev.filter((id) => allowedIds.has(id)));
  }, [sourceEntries, selectionMode]);

  const filteredEntries = useMemo(() => {
    if (!Array.isArray(sourceEntries) || sourceEntries.length === 0) {
      return [];
    }

    if (!effectiveShowFilter) {
      return sourceEntries;
    }

    const filter = ENTRY_FILTERS.find((f) => f.id === filterId) || ENTRY_FILTERS[0];
    if (!filter.days) {
      return sourceEntries;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (filter.days - 1));
    const startKey = start.toISOString().slice(0, 10);

    return sourceEntries.filter((entry) => entry.date && entry.date >= startKey);
  }, [sourceEntries, filterId, effectiveShowFilter]);

  const visibleEntries = effectiveAllowLoadMore
    ? filteredEntries.slice(0, visibleCount)
    : filteredEntries;

  const hasMore = effectiveAllowLoadMore && filteredEntries.length > visibleEntries.length;

  const displayTitle = isPreview ? (previewTitle ?? title) : title;
  const displaySubtitle = isPreview ? (previewSubtitle ?? subtitle) : subtitle;

  const selectedCount = selectedIds.length;
  const bulkDeleteDisabled = selectedCount === 0;

  const toggleSelectionMode = () => {
    if (!selectable) return;
    setSelectionMode((prev) => {
      const next = !prev;
      if (next && collapsible) {
        setExpanded(true);
      }
      if (!next) {
        setSelectedIds([]);
      }
      return next;
    });
  };

  const handleEntrySelectToggle = (entryId) => {
    setSelectedIds((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  };

  const selectAll = () => {
    const allIds = filteredEntries.map((entry) => entry.id);
    setSelectedIds(allIds);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || bulkDeleteDisabled) return;
    await onBulkDelete(selectedIds);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  return (
    <section className="space-y-3">
      {(displayTitle || displaySubtitle || selectable) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {(displayTitle || displaySubtitle) && (
            <SectionTitle title={displayTitle} subtitle={displaySubtitle} />
          )}
          {selectable && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectionMode}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:border-theme hover:text-theme"
              >
                {selectionMode ? "Kijelölés vége" : "Tömeges kijelölés"}
              </button>
              {selectionMode && (
                <>
                  <span className="text-sm text-slate-500">
                    Kijelölve: {selectedCount}
                  </span>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm text-slate-600 hover:border-theme hover:text-theme"
                  >
                    Mind kijelöl
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm text-slate-600 hover:border-theme hover:text-theme"
                    disabled={bulkDeleteDisabled}
                  >
                    Kijelölés törlése
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium text-white transition ${
                      bulkDeleteDisabled
                        ? "bg-red-200 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                    disabled={bulkDeleteDisabled}
                  >
                    Kijelöltek törlése
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {effectiveShowFilter && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ENTRY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setFilterId(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border transition whitespace-nowrap ${
                filterId === filter.id
                  ? "bg-theme text-white border-theme"
                  : "bg-white text-slate-600 border-slate-200 hover:border-theme"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {visibleEntries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Nincs megjeleníthető bejegyzés a kiválasztott időszakban.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              symptoms={symptoms}
              onEdit={selectionMode ? undefined : onEdit}
              onDelete={selectionMode ? undefined : onDelete}
              showDate={showDate}
              compactButtons={compactButtons}
              selectable={selectionMode}
              selected={selectedIds.includes(entry.id)}
              onSelectToggle={handleEntrySelectToggle}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + LOAD_STEP)}
            className="px-4 py-2 rounded-2xl border border-slate-300 text-sm font-medium text-slate-700 hover:border-theme hover:text-theme"
          >
            További bejegyzések betöltése
          </button>
        </div>
      )}

      {collapsible && entries.length > previewCount && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-2xl border text-sm font-medium ${
              selectionMode
                ? "border-slate-200 text-slate-400 cursor-not-allowed"
                : "border-slate-300 text-slate-700 hover:border-theme hover:text-theme"
            }`}
            disabled={selectionMode}
          >
            {expanded ? toggleLabels.collapse : toggleLabels.expand}
          </button>
        </div>
      )}
    </section>
  );
}
