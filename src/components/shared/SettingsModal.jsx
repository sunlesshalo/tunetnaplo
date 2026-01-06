import React, { useState } from "react";

export default function SettingsModal({
  isOpen,
  onClose,
  userName,
  setUserName,
  theme,
  setTheme,
  themes,
}) {
  const [tempName, setTempName] = useState(userName);

  if (!isOpen) return null;

  const handleSave = () => {
    setUserName(tempName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Beallitasok</h2>

        {/* Name input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            A neved
          </label>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Ird be a neved..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300 text-lg"
            autoFocus
          />
        </div>

        {/* Theme picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Szin
          </label>
          <div className="flex gap-3 justify-center">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-12 h-12 rounded-full transition-all ${
                  theme === t.id
                    ? "ring-4 ring-offset-2 ring-slate-400 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: t.color }}
                aria-label={t.label}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-300 py-3 font-medium"
          >
            Megse
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-sky-500 text-white py-3 font-semibold hover:bg-sky-600 active:bg-sky-700"
          >
            Mentes
          </button>
        </div>
      </div>
    </div>
  );
}
