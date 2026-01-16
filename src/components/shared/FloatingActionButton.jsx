import React, { useState } from 'react';

/**
 * Floating Action Button with optional speed dial menu
 * Shows a + button that can either:
 * - Open a symptom picker directly
 * - Show expandable quick actions
 */
export default function FloatingActionButton({
  symptoms,
  onLogSymptom,
  onAddSymptom,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSymptomPicker, setShowSymptomPicker] = useState(false);

  const handleMainClick = () => {
    if (symptoms?.length === 0) {
      // No symptoms - go to add symptom
      onAddSymptom?.();
    } else if (symptoms?.length === 1) {
      // Only one symptom - log it directly
      onLogSymptom?.(symptoms[0]);
    } else {
      // Multiple symptoms - show picker
      setShowSymptomPicker(true);
    }
  };

  const handleSymptomSelect = (symptom) => {
    setShowSymptomPicker(false);
    onLogSymptom?.(symptom);
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={handleMainClick}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-theme text-white shadow-lg hover:bg-theme-dark active:scale-95 transition-all flex items-center justify-center"
        aria-label="Gyors rögzítés"
      >
        <span className="text-2xl">+</span>
      </button>

      {/* Symptom Picker Modal */}
      {showSymptomPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0"
          onClick={() => setShowSymptomPicker(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl shadow-xl max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Melyik tünetet rögzíted?
              </h3>
              <button
                onClick={() => setShowSymptomPicker(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Symptom Grid */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-2 gap-3">
                {symptoms?.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSymptomSelect(s)}
                    className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3 active:scale-[0.98] transition hover:border-theme hover:bg-theme/5"
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="font-medium text-sm truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
