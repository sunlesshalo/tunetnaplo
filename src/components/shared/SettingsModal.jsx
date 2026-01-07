import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isBiometricAvailable,
  getBiometricName,
  registerBiometric,
  authenticateWithBiometric,
  removeBiometricCredential,
  hasBiometricCredential,
} from "../../utils/biometricAuth";

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
  biometricEnabled,
  setBiometricEnabled,
}) {
  const navigate = useNavigate();
  const [tempName, setTempName] = useState(userName);
  const [tempTheme, setTempTheme] = useState(theme);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState("");
  const [showBiometricFallback, setShowBiometricFallback] = useState(false);

  // Reset temp values and check biometric availability when modal opens
  useEffect(() => {
    async function checkBiometric() {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        setBiometricName(getBiometricName());
      }
    }
    if (isOpen) {
      // Reset temp values to current saved values when modal opens
      setTempName(userName);
      setTempTheme(theme);
      checkBiometric();
      setShowBiometricFallback(false);
    }
  }, [isOpen, userName, theme]);

  if (!isOpen) return null;

  const handleSave = () => {
    setUserName(tempName.trim());
    setTheme(tempTheme);
    onClose();
  };

  const handleParentMode = () => {
    // If PIN is set, validate it
    if (parentPin) {
      if (pinInput === parentPin) {
        onClose();
        navigate("/szulo");
      } else {
        setPinError("Hibás PIN kód");
        setPinInput("");
      }
    } else {
      // No PIN set, go directly
      onClose();
      navigate("/szulo");
    }
  };

  const handleBiometricAuth = async () => {
    const result = await authenticateWithBiometric();
    if (result.success) {
      onClose();
      navigate("/szulo");
    } else {
      // Show fallback to PIN if available
      if (parentPin) {
        setShowBiometricFallback(true);
        setPinError(result.error || "Biometrikus azonosítás sikertelen");
      } else {
        setPinError(result.error || "Biometrikus azonosítás sikertelen");
      }
    }
  };

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      // Disable biometric
      removeBiometricCredential();
      setBiometricEnabled(false);
    } else {
      // Enable biometric - register credential
      const result = await registerBiometric();
      if (result.success) {
        setBiometricEnabled(true);
      } else {
        setPinError(result.error || "Nem sikerült beállítani a biometrikus azonosítást");
      }
    }
  };

  const handleSetPin = () => {
    if (newPin.length < 4) {
      setPinError("A PIN kódnak legalább 4 számjegyűnek kell lennie");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("A két PIN kód nem egyezik");
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
        <h2 className="text-xl font-bold mb-6">Beállítások</h2>

        {/* Name input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            A neved
          </label>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Írd be a neved..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme text-lg"
          />
        </div>

        {/* Theme picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Szín
          </label>
          <div className="flex gap-3 justify-center">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTempTheme(t.id)}
                className={`w-12 h-12 rounded-full transition-all ${
                  tempTheme === t.id
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
            Szülő mód
          </label>

          {/* Biometric auth button - show if enabled and not in fallback mode */}
          {biometricEnabled && !showBiometricFallback && (
            <button
              type="button"
              onClick={handleBiometricAuth}
              className="w-full rounded-xl bg-theme hover:bg-theme-dark text-white py-3 font-medium transition-colors mb-3 flex items-center justify-center gap-2"
            >
              <span className="text-xl">🔓</span>
              Megnyitás {biometricName}-vel
            </button>
          )}

          {/* PIN input - show if PIN set AND (no biometric OR in fallback mode) */}
          {parentPin && (!biometricEnabled || showBiometricFallback) && (
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
                placeholder="PIN kód..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme text-lg text-center tracking-widest"
                maxLength={6}
              />
            </div>
          )}

          {pinError && (
            <p className="text-red-500 text-sm mb-3 text-center">{pinError}</p>
          )}

          {/* Open parent mode button - show if no biometric OR in fallback mode */}
          {(!biometricEnabled || showBiometricFallback) && (
            <button
              type="button"
              onClick={handleParentMode}
              className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-3 font-medium text-slate-700 transition-colors"
            >
              {parentPin ? "Szülő mód megnyitása" : "Szülő mód megnyitása (nincs védelem)"}
            </button>
          )}

          {/* Security settings section */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-3">Biztonság</p>

            {/* Biometric toggle - only show if device supports it */}
            {biometricAvailable && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔐</span>
                  <span className="text-sm font-medium">{biometricName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBiometric}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    biometricEnabled ? "bg-theme" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      biometricEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* PIN status and setup */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔢</span>
                <span className="text-sm font-medium">
                  PIN kód {parentPin ? "✓" : "(nincs)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPinSetup(!showPinSetup)}
                className="text-sm text-theme hover:text-theme-dark font-medium"
              >
                {parentPin ? "Módosítás" : "Beállítás"}
              </button>
            </div>

            {/* PIN setup form */}
            {showPinSetup && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl space-y-3">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Új PIN kód (min. 4 számjegy)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-center tracking-widest"
                  maxLength={6}
                />
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="PIN kód megerősítése"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-center tracking-widest"
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSetPin}
                    className="flex-1 rounded-lg bg-theme text-white py-2 text-sm font-medium hover:bg-theme-dark"
                  >
                    Mentés
                  </button>
                  {parentPin && (
                    <button
                      type="button"
                      onClick={handleRemovePin}
                      className="rounded-lg bg-red-100 text-red-600 py-2 px-3 text-sm font-medium hover:bg-red-200"
                    >
                      Törlés
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-300 py-3 font-medium"
          >
            Mégse
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-theme text-white py-3 font-semibold hover:bg-theme-dark active:bg-theme-dark"
          >
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
}
