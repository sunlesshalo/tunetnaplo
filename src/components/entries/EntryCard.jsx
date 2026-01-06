import React, { useState } from "react";
import AuthenticatedAudio from "../shared/AuthenticatedAudio";

// Convert Google Drive fileId to viewable URL (works for authenticated owner)
const getPhotoUrl = (fileId) => `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

export default function EntryCard({
  entry,
  symptoms,
  onEdit,
  onDelete,
  showDate = false,
  compactButtons = false,
  selectable = false,
  selected = false,
  onSelectToggle,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const s = symptoms.find((x) => x.id === (entry.symptom_id || entry.symptomId));
  const time = new Date(entry.timestamp).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
  const context = entry.context || {};
  const env = entry.environment || {};
  const weather = env.weather || {};

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} perc`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} óra`;
    return `${hours}ó ${mins}p`;
  };

  const hasContext = context.mood || context.energy || context.activity || context.food || context.medication;
  const hasEnv = weather.condition || weather.temp || weather.pressure || env.location || env.timeOfDay !== undefined || env.dayOfWeek !== undefined;
  const hasMedia = (entry.photos && entry.photos.length > 0) || entry.voice_note;

  const toggleSelect = (event) => {
    event.stopPropagation();
    if (onSelectToggle) {
      onSelectToggle(entry.id);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-white ${
        selectable && selected ? "border-sky-300 ring-2 ring-sky-200" : "border-slate-200"
      }`}
    >
      <div className="p-3">
        <div
          className={
            compactButtons
              ? "flex items-start justify-between mb-2"
              : "flex items-center justify-between mb-1"
          }
        >
          <div className="flex items-start gap-2 flex-1">
            {selectable && (
              <input
                type="checkbox"
                checked={selected}
                onChange={toggleSelect}
                onClick={(e) => e.stopPropagation()}
                className="mt-1.5 h-4 w-4 accent-sky-500"
              />
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <span className="text-2xl">{s?.emoji ?? "❓"}</span>
              <div className="flex-1">
                <div className="font-medium">{s?.name ?? "Ismeretlen"}</div>
                <div className="text-xs text-slate-500">
                  {showDate && <>{entry.date} • </>}
                  {time}
                  {entry.duration && <> • {formatDuration(entry.duration)}</>}
                </div>
              </div>
              {(hasContext || hasEnv || hasMedia) && (
                <span className="text-slate-400 text-xs">{isExpanded ? "▼" : "▶"}</span>
              )}
            </button>
          </div>
          {!selectable && !compactButtons && (
            <span className="text-sm px-2 py-1 rounded-lg bg-sky-100 font-semibold ml-2">
              {entry.intensity}
            </span>
          )}
          {!selectable && compactButtons && (onEdit || onDelete) && (
            <div className="flex gap-1 ml-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(entry)}
                  className="text-sky-600 hover:text-sky-700 px-2 py-1 rounded-lg hover:bg-sky-50 text-sm"
                >
                  Szerkeszt
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 text-sm"
                >
                  Törlés
                </button>
              )}
            </div>
          )}
        </div>
        {compactButtons && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Erősség:</span>
            <span className="text-sm px-2 py-0.5 rounded-lg bg-sky-100 font-semibold">
              {entry.intensity}/10
            </span>
          </div>
        )}
        {entry.note && (
          <div className={`text-xs text-slate-600 mt-2 italic ${compactButtons ? '' : 'pl-11'}`}>"{entry.note}"</div>
        )}
      </div>

      {/* Expanded view */}
      {isExpanded && (hasContext || hasEnv || hasMedia) && (
        <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-3">
          {/* Context section */}
          {hasContext && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">📝 Kontextus</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {context.mood && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Hangulat:</span>
                    <span className="ml-1 font-medium">{context.mood}</span>
                  </div>
                )}
                {context.energy && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Energia:</span>
                    <span className="ml-1 font-medium">{context.energy}</span>
                  </div>
                )}
                {context.activity && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Tevékenység:</span>
                    <span className="ml-1 font-medium">{context.activity}</span>
                  </div>
                )}
                {context.food && (
                  <div className="bg-white rounded-lg p-2 col-span-2">
                    <span className="text-slate-500">Étel:</span>
                    <span className="ml-1 font-medium">{context.food}</span>
                  </div>
                )}
                {context.medication && (
                  <div className="bg-white rounded-lg p-2 col-span-2">
                    <span className="text-slate-500">Gyógyszer:</span>
                    <span className="ml-1 font-medium">{context.medication}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Environment section */}
          {hasEnv && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">🌤️ Környezet</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {weather.condition && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Időjárás:</span>
                    <span className="ml-1 font-medium">{weather.condition}</span>
                  </div>
                )}
                {weather.temp && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Hőmérséklet:</span>
                    <span className="ml-1 font-medium">{weather.temp}°C</span>
                  </div>
                )}
                {weather.pressure && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Légnyomás:</span>
                    <span className="ml-1 font-medium">{weather.pressure} hPa</span>
                  </div>
                )}
                {weather.city && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Helyszín:</span>
                    <span className="ml-1 font-medium">{weather.city}</span>
                  </div>
                )}
                {env.timeOfDay !== undefined && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Időszak:</span>
                    <span className="ml-1 font-medium">{env.timeOfDay}h</span>
                  </div>
                )}
                {env.dayOfWeek !== undefined && (
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-slate-500">Nap:</span>
                    <span className="ml-1 font-medium">{['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'][env.dayOfWeek]}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos section */}
          {entry.photos && entry.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">📸 Fotók</h4>
              <div className="grid grid-cols-3 gap-2">
                {entry.photos.map((photoPath, index) => (
                  <img
                    key={index}
                    src={getPhotoUrl(photoPath)}
                    alt={`Symptom photo ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Voice note section */}
          {entry.voice_note && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">🎤 Hangfelvetel</h4>
              <AuthenticatedAudio fileId={entry.voice_note} className="w-full h-10" />
            </div>
          )}

          {/* Edit/Delete buttons (if callbacks provided) */}
          {(onEdit || onDelete) && !compactButtons && !selectable && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(entry)}
                  className="flex-1 px-3 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition"
                >
                  ✏️ Szerkesztés
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                >
                  🗑️ Törlés
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
