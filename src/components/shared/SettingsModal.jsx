import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsModal({
  isOpen,
  onClose,
  userName,
  setUserName,
  theme,
  setTheme,
  themes,
  parentPin,
  setParentPin,
}) {
  const navigate = useNavigate();
  const [tempName, setTempName] = useState(userName);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    setUserName(tempName.trim());
    onClose();
  };

  const handleParentMode = () => {
    // If PIN is set, validate it
    if (parentPin) {
      if (pinInput === parentPin) {
        onClose();
        navigate("/szulo");
      } else {
        setPinError("Hibas PIN kod");
        setPinInput("");
      }
    } else {
      // No PIN set, go directly
      onClose();
      navigate("/szulo");
    }
  };

  const handleSetPin = () => {
    if (newPin.length < 4) {
      setPinError("A PIN kodnak legalabb 4 szamjegyunek kell lennie");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("A ket PIN kod nem egyezik");
      return;
    }
    setParentPin(newPin);
    setShowPinSetup(false);
    setNewPin("");
    setConfirmPin("");
    setPinError("");
  };

  const handleRemovePin = () => {
    setParentPin("");
    setShowPinSetup(false);
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
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme text-lg"
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

        {/* Parent mode section */}
        <div className="mb-6 pt-4 border-t border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Szulo mod
          </label>

          {parentPin && (
            <div className="mb-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ""));
                  setPinError("");
                }}
                placeholder="PIN kod..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme text-lg text-center tracking-widest"
                maxLength={6}
              />
            </div>
          )}

          {pinError && (
            <p className="text-red-500 text-sm mb-3 text-center">{pinError}</p>
          )}

          <button
            type="button"
            onClick={handleParentMode}
            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-3 font-medium text-slate-700 transition-colors"
          >
            Szulo mod megnyitasa
          </button>

          {/* PIN setup toggle */}
          <button
            type="button"
            onClick={() => setShowPinSetup(!showPinSetup)}
            className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700"
          >
            {parentPin ? "PIN kod modositasa" : "PIN kod beallitasa (opcionalis)"}
          </button>

          {/* PIN setup form */}
          {showPinSetup && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl space-y-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Uj PIN kod (min. 4 szamjegy)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-center tracking-widest"
                maxLength={6}
              />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="PIN kod megerositese"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-center tracking-widest"
                maxLength={6}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSetPin}
                  className="flex-1 rounded-lg bg-theme text-white py-2 text-sm font-medium hover:bg-theme-dark"
                >
                  Mentes
                </button>
                {parentPin && (
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="rounded-lg bg-red-100 text-red-600 py-2 px-3 text-sm font-medium hover:bg-red-200"
                  >
                    Torles
                  </button>
                )}
              </div>
            </div>
          )}
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
            className="flex-1 rounded-2xl bg-theme text-white py-3 font-semibold hover:bg-theme-dark active:bg-theme-dark"
          >
            Mentes
          </button>
        </div>
      </div>
    </div>
  );
}
