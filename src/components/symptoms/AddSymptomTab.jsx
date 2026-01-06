import React, { useState } from "react";
import SectionTitle from "../shared/SectionTitle";
import HintCard from "../shared/HintCard";
import { EMOJI_SET } from "../../utils/constants";

export default function AddSymptomTab({ onAdd, symptoms, onDelete, onUpdate }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤒");
  const [parentOnly, setParentOnly] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editingId) {
      // Update existing symptom
      onUpdate(editingId, { name: trimmed, emoji, parent_only: parentOnly });
      setEditingId(null);
    } else {
      // Add new symptom
      onAdd({ name: trimmed, emoji, parentOnly });
    }

    setName("");
    setEmoji("🤒");
    setParentOnly(false);
  };

  const startEdit = (symptom) => {
    setEditingId(symptom.id);
    setName(symptom.name);
    setEmoji(symptom.emoji);
    setParentOnly(symptom.parent_only || symptom.parentOnly || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setEmoji("🤒");
    setParentOnly(false);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={editingId ? "Tünet szerkesztése" : "Új tünet hozzáadása"}
        subtitle={editingId ? "Módosítsd a tünet nevét vagy ikonját." : "Adj nevet és válassz ikont (emoji)."}
      />

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Tünet neve</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="pl. Hasfájás"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="text-3xl rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm"
            aria-label="Emoji választó"
            title="Emoji választó"
          >
            {emoji}
          </button>
          <span className="text-sm text-slate-600">Koppints az ikonra az emoji választóhoz</span>
        </div>

        {pickerOpen && (
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm grid grid-cols-8 gap-2 max-h-56 overflow-auto">
            {EMOJI_SET.map((e, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setEmoji(e); setPickerOpen(false); }}
                className="text-2xl p-1 rounded-lg hover:bg-slate-100 active:bg-slate-200"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
          <input
            type="checkbox"
            checked={parentOnly}
            onChange={(e) => setParentOnly(e.target.checked)}
            className="w-5 h-5 accent-theme"
          />
          <div>
            <span className="text-sm font-medium">Csak szülő módban látható</span>
            <p className="text-xs text-slate-500">Ez a tünet nem jelenik meg a gyerek nézetben</p>
          </div>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-theme hover:bg-theme-dark text-white font-semibold py-3 active:scale-[0.99]"
          >
            {editingId ? "Mentés" : "Hozzáadás"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 rounded-2xl bg-slate-200 text-slate-700 font-semibold py-3 active:scale-[0.99]"
            >
              Mégse
            </button>
          )}
        </div>
      </form>

      {symptoms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-600">Meglévő tünetek</h3>
          <div className="space-y-2">
            {symptoms.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1">
                    <span className="font-medium">{s.name}</span>
                    {s.parentOnly && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        👨‍👩‍👦 Szülő
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(s)}
                    className="text-theme hover:text-theme-dark px-3 py-1 rounded-lg hover:bg-theme-light text-sm font-medium"
                  >
                    Szerkesztés
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 text-sm font-medium"
                  >
                    Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <HintCard />
    </div>
  );
}
