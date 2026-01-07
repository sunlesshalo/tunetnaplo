import React, { useState } from "react";
import PhotoUpload from "../../PhotoUpload";
import VoiceRecorder from "../../VoiceRecorder";

export default function LogModal({
  symptom,
  intensity,
  setIntensity,
  duration,
  setDuration,
  note,
  setNote,
  mood,
  setMood,
  energy,
  setEnergy,
  activity,
  setActivity,
  foodNote,
  setFoodNote,
  medicationNote,
  setMedicationNote,
  photos,
  setPhotos,
  voiceNote,
  setVoiceNote,
  entryDate,
  setEntryDate,
  entryTime,
  setEntryTime,
  userId,
  isParentMode,
  isEditing,
  isSaving,
  onClose,
  onSave
}) {
  const [contextOpen, setContextOpen] = useState(false);

  const durationPresets = [
    { label: "5 perc", value: 5 },
    { label: "15 perc", value: 15 },
    { label: "30 perc", value: 30 },
    { label: "1 óra", value: 60 },
    { label: "2+ óra", value: 120 },
  ];

  const moodOptions = [
    { label: "Jó", emoji: "😊", value: "jó" },
    { label: "Oké", emoji: "😐", value: "oké" },
    { label: "Szomorú", emoji: "😢", value: "szomorú" },
    { label: "Mérges", emoji: "😠", value: "mérges" },
  ];

  const energyOptions = [
    { label: "Energikus", emoji: "⚡", value: "energikus" },
    { label: "Fáradt", emoji: "😴", value: "fáradt" },
    { label: "Nagyon fáradt", emoji: "🥱", value: "nagyon fáradt" },
  ];

  const activityOptions = [
    { label: "Mozgás", emoji: "🏃", value: "mozgás" },
    { label: "Tanulás", emoji: "📚", value: "tanulás" },
    { label: "Játék", emoji: "🎮", value: "játék" },
    { label: "Pihenés", emoji: "🛏️", value: "pihenés" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{symptom.emoji}</span>
          <h3 className="text-lg font-semibold">{symptom.name}</h3>
        </div>

        {/* Date/Time picker */}
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-medium text-slate-600 mb-2 block">Mikor történt?</span>
          <div className="flex gap-2">
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-sm"
            />
            <input
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-sm"
            />
          </div>
        </div>

        <label className="block mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Erősség</span>
            <span className="text-sm bg-theme-light px-2 py-0.5 rounded-lg">{intensity}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="w-full accent-theme"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span><span>5</span><span>10</span>
          </div>
        </label>

        <div className="block mb-4">
          <span className="text-sm font-medium">Időtartam (opcionális)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {durationPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setDuration(preset.value.toString())}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  duration === preset.value.toString()
                    ? "bg-theme text-white border-theme"
                    : "bg-white text-slate-700 border-slate-300 hover:border-theme"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Vagy írj percet..."
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-theme text-sm"
          />
        </div>

        <label className="block mb-4">
          <span className="text-sm font-medium">Jegyzet (opcionális)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rövid megjegyzés..."
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme min-h-[80px]"
          />
        </label>

        {/* Photo Upload */}
        {userId && setPhotos && (
          <div className="mb-4">
            <PhotoUpload
              userId={userId}
              photos={photos || []}
              onChange={setPhotos}
            />
          </div>
        )}

        {/* Voice Note Recorder */}
        {userId && setVoiceNote && (
          <div className="mb-4">
            <VoiceRecorder
              userId={userId}
              voiceNotePath={voiceNote}
              onChange={setVoiceNote}
            />
          </div>
        )}

        {/* Context section - collapsible */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setContextOpen(!contextOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
          >
            <span className="text-sm font-medium">Hogy érzed magad? (opcionális)</span>
            <span className="text-lg">{contextOpen ? "▼" : "▶"}</span>
          </button>

          {contextOpen && (
            <div className="mt-3 space-y-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
              {/* Mood */}
              <div>
                <span className="text-xs font-medium text-slate-600 mb-2 block">Hangulat</span>
                <div className="grid grid-cols-2 gap-2">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMood(mood === option.value ? "" : option.value)}
                      className={`p-2 rounded-lg border transition text-sm font-medium ${
                        mood === option.value
                          ? "bg-theme text-white border-theme"
                          : "bg-white text-slate-700 border-slate-300 hover:border-theme"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div>
                <span className="text-xs font-medium text-slate-600 mb-2 block">Energia</span>
                <div className="grid grid-cols-2 gap-2">
                  {energyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEnergy(energy === option.value ? "" : option.value)}
                      className={`p-2 rounded-lg border transition text-sm font-medium ${
                        energy === option.value
                          ? "bg-theme text-white border-theme"
                          : "bg-white text-slate-700 border-slate-300 hover:border-theme"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div>
                <span className="text-xs font-medium text-slate-600 mb-2 block">Mit csináltál?</span>
                <div className="grid grid-cols-2 gap-2">
                  {activityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActivity(activity === option.value ? "" : option.value)}
                      className={`p-2 rounded-lg border transition text-sm font-medium ${
                        activity === option.value
                          ? "bg-theme text-white border-theme"
                          : "bg-white text-slate-700 border-slate-300 hover:border-theme"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parent-only fields */}
              {isParentMode && (
                <>
                  <div>
                    <span className="text-xs font-medium text-slate-600 mb-1 block">Étel/Táplálék (opcionális)</span>
                    <input
                      type="text"
                      value={foodNote}
                      onChange={(e) => setFoodNote(e.target.value)}
                      placeholder="pl. alma, brokkoli"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-sm"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-600 mb-1 block">Gyógyszer (opcionális)</span>
                    <input
                      type="text"
                      value={medicationNote}
                      onChange={(e) => setMedicationNote(e.target.value)}
                      placeholder="pl. antihistamin, fájdalomcsillapító"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-theme text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-300 py-3"
          >
            Mégse
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            aria-busy={isSaving}
            className={`flex-1 rounded-2xl font-semibold py-3 text-white transition ${
              isSaving
                ? "bg-theme cursor-not-allowed opacity-70"
                : "bg-theme hover:bg-theme-dark active:bg-theme-dark"
            }`}
          >
            {isSaving
              ? (isEditing ? "Módosítás..." : "Mentés...")
              : isEditing
                ? "Módosítás"
                : "Mentés"}
          </button>
        </div>
      </div>
    </div>
  );
}
