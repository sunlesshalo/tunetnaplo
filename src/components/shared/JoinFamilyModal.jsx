import React, { useState } from 'react';

/**
 * Modal shown to new users when shared spreadsheets are detected
 * Allows Parent B to join Parent A's family or create their own
 */
export default function JoinFamilyModal({
  isOpen,
  sharedSpreadsheets,
  onJoin,
  onCreate,
  isLoading,
}) {
  const [selectedId, setSelectedId] = useState(null);

  if (!isOpen) return null;

  const handleJoin = () => {
    if (selectedId) {
      onJoin(selectedId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <h2 className="text-xl font-bold text-slate-800">
            Családi megosztás észlelve
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Valaki megosztotta veled a Tünetnapló adatait. Szeretnéd csatlakozni?
          </p>
        </div>

        {/* Shared spreadsheets list */}
        <div className="px-6 pb-4">
          <div className="space-y-2">
            {sharedSpreadsheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setSelectedId(sheet.id)}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selectedId === sheet.id
                    ? 'border-theme bg-theme/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">📊</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-800">
                    {sheet.ownerName || 'Család'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Megosztotta: {sheet.ownerEmail}
                  </p>
                </div>
                {selectedId === sheet.id && (
                  <span className="text-theme text-xl">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 space-y-3">
          <button
            onClick={handleJoin}
            disabled={!selectedId || isLoading}
            className="w-full py-3 px-4 rounded-xl bg-theme text-white font-semibold hover:bg-theme-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Csatlakozás...' : 'Csatlakozás a családhoz'}
          </button>

          <button
            onClick={onCreate}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            Saját adatok létrehozása
          </button>

          <p className="text-xs text-center text-slate-400 mt-2">
            Ha csatlakozol, ugyanazokat az adatokat fogod látni és szerkeszteni.
          </p>
        </div>
      </div>
    </div>
  );
}
