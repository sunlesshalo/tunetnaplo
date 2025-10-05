import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// --- Utility helpers ---
const LS_KEYS = {
  symptoms: "symptoms_v1",
  entries: "entries_v1",
  parentPin: "parent_pin_v1",
};

const todayISO = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_SYMPTOMS = [];

// Expanded emoji selection - health and symptom related
const EMOJI_SET = [
  // Medical/Health
  "🤒", "🤕", "🤧", "🤢", "🤮", "😷", "🩹", "💊", "💉", "🌡️",
  // Pain/Discomfort
  "😖", "😣", "😫", "😩", "😵", "🥴", "😪", "😴", "🥱", "😮‍💨",
  // Temperature
  "🥵", "🥶", "🔥", "❄️", "💧",
  // Digestive
  "🤰", "🍽️", "🚽", "💩",
  // Breathing/Respiratory
  "😮", "😤", "💨", "🫁",
  // Mental/Mood
  "😰", "😥", "😓", "😔", "😞", "😢", "😭", "😱", "😨", "😧",
  // Energy
  "😑", "😶", "🫥", "😐", "😬", "🥺", "😟", "🙁", "☹️",
  // Body parts
  "👁️", "👂", "👃", "👄", "🦷", "🫀", "🫁", "🧠", "🦴", "👣",
  // General
  "⚡", "💫", "⭐", "✨", "💥", "🔴", "🟠", "🟡", "🟢", "🔵",
];

// --- Main App with Routing ---
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChildView />} />
      <Route path="/szulo" element={<ParentView />} />
    </Routes>
  );
}

// --- Child View (Simplified) ---
function ChildView() {
  const [symptoms, setSymptoms] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.symptoms);
    const all = raw ? JSON.parse(raw) : DEFAULT_SYMPTOMS;
    // Only show symptoms NOT marked as parentOnly
    return all.filter(s => !s.parentOnly);
  });
  const [entries, setEntries] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.entries);
    return raw ? JSON.parse(raw) : [];
  });

  // Persist entries only (symptoms managed by parent)
  useEffect(() => {
    localStorage.setItem(LS_KEYS.entries, JSON.stringify(entries));
  }, [entries]);

  // Reload symptoms when they change (from parent view)
  useEffect(() => {
    const handleStorage = () => {
      const raw = localStorage.getItem(LS_KEYS.symptoms);
      const all = raw ? JSON.parse(raw) : DEFAULT_SYMPTOMS;
      setSymptoms(all.filter(s => !s.parentOnly));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Modal state for quick log
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState("");

  const openLogModal = (symptom) => {
    setActiveSymptom(symptom);
    setIntensity(5);
    setNote("");
    setDuration("");
  };
  const closeLogModal = () => setActiveSymptom(null);

  const saveEntry = () => {
    if (!activeSymptom) return;
    const now = new Date();
    const entry = {
      id: uid(),
      date: todayISO(),
      timestamp: now.toISOString(),
      symptomId: activeSymptom.id,
      intensity: Number(intensity),
      duration: duration ? Number(duration) : null,
      note: note.trim(),
    };
    setEntries((prev) => [entry, ...prev]);
    closeLogModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-sky-50 text-slate-800 flex flex-col">
      <Header isChild={true} />
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-6">
        <HomeTab symptoms={symptoms} onLog={openLogModal} entries={entries} />
      </main>

      {activeSymptom && (
        <LogModal
          symptom={activeSymptom}
          intensity={intensity}
          setIntensity={setIntensity}
          duration={duration}
          setDuration={setDuration}
          note={note}
          setNote={setNote}
          onClose={closeLogModal}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}

// --- Parent View (Full Features) ---
function ParentView() {
  const [tab, setTab] = useState(0); // 0: Főlista, 1: Tünetek, 2: Bejegyzések, 3: Export
  const [symptoms, setSymptoms] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.symptoms);
    return raw ? JSON.parse(raw) : DEFAULT_SYMPTOMS;
  });
  const [entries, setEntries] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.entries);
    return raw ? JSON.parse(raw) : [];
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(LS_KEYS.symptoms, JSON.stringify(symptoms));
  }, [symptoms]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.entries, JSON.stringify(entries));
  }, [entries]);

  // Modal state
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState("");

  const openLogModal = (symptom) => {
    setActiveSymptom(symptom);
    setIntensity(5);
    setNote("");
    setDuration("");
  };
  const closeLogModal = () => setActiveSymptom(null);

  const saveEntry = () => {
    if (!activeSymptom) return;
    const now = new Date();
    const entry = {
      id: uid(),
      date: todayISO(),
      timestamp: now.toISOString(),
      symptomId: activeSymptom.id,
      intensity: Number(intensity),
      duration: duration ? Number(duration) : null,
      note: note.trim(),
    };
    setEntries((prev) => [entry, ...prev]);
    closeLogModal();
  };

  const deleteSymptom = (symptomId) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt a tünetet?")) {
      setSymptoms((prev) => prev.filter((s) => s.id !== symptomId));
      setEntries((prev) => prev.filter((e) => e.symptomId !== symptomId));
    }
  };

  const deleteEntry = (entryId) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt a bejegyzést?")) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-sky-50 text-slate-800 flex flex-col">
      <Header isChild={false} />

      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-28">
        {tab === 0 && (
          <HomeTab symptoms={symptoms} onLog={openLogModal} entries={entries} />
        )}
        {tab === 1 && (
          <AddSymptomTab
            onAdd={(s) => setSymptoms((prev) => [s, ...prev])}
            symptoms={symptoms}
            onDelete={deleteSymptom}
          />
        )}
        {tab === 2 && (
          <ManageEntriesTab entries={entries} symptoms={symptoms} onDelete={deleteEntry} />
        )}
        {tab === 3 && <ExportTab entries={entries} symptoms={symptoms} />}
      </main>

      <ParentBottomNav tab={tab} setTab={setTab} />

      {activeSymptom && (
        <LogModal
          symptom={activeSymptom}
          intensity={intensity}
          setIntensity={setIntensity}
          duration={duration}
          setDuration={setDuration}
          note={note}
          setNote={setNote}
          onClose={closeLogModal}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}

function Header({ isChild }) {
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-slate-200">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isChild ? "🧸" : "👨‍👩‍👦"}</span>
          <div>
            <h1 className="text-xl font-bold">Tünetnapló</h1>
            <p className="text-sm text-slate-500">
              {isChild ? "Gyerekbarát gyors rögzítés" : "Szülő mód"}
            </p>
          </div>
        </div>
        {!isChild && (
          <Link to="/" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
            Gyerek nézet →
          </Link>
        )}
      </div>
    </header>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { label: "Főlista", icon: "🏠" },
    { label: "Új tünet", icon: "➕" },
    { label: "Statisztika", icon: "📊" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200">
      <div className="max-w-md mx-auto grid grid-cols-3">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex flex-col items-center py-3 text-sm ${
              tab === i ? "font-semibold" : "text-slate-500"
            }`}
          >
            <span className="text-xl leading-none">{it.icon}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function ParentBottomNav({ tab, setTab }) {
  const items = [
    { label: "Főlista", icon: "🏠" },
    { label: "Tünetek", icon: "⚙️" },
    { label: "Bejegyzések", icon: "📝" },
    { label: "Export", icon: "📤" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex flex-col items-center py-3 text-xs ${
              tab === i ? "font-semibold" : "text-slate-500"
            }`}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="mt-1">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// --- Home Tab ---
function HomeTab({ symptoms, onLog, entries }) {
  // Last 3 entries for quick glance
  const recent = entries.slice(0, 5);
  return (
    <div className="space-y-6">
      <SectionTitle title="Ma milyen tünet volt?" subtitle="Koppints egy kártyára, majd állítsd be az erősséget." />
      <div className="grid grid-cols-2 gap-3">
        {symptoms.map((s) => (
          <button
            key={s.id}
            onClick={() => onLog(s)}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex items-center gap-3 active:scale-[0.98] transition"
          >
            <span className="text-3xl" aria-hidden>{s.emoji}</span>
            <span className="text-lg font-medium">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Legutóbbi bejegyzések</h3>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-slate-500">Még nincs rögzített bejegyzés.</p>
          )}
          {recent.map((e) => (
            <RecentEntry key={e.id} entry={e} symptoms={symptoms} />)
          )}
        </div>
      </div>
    </div>
  );
}

function RecentEntry({ entry, symptoms }) {
  const s = symptoms.find((x) => x.id === entry.symptomId);
  const time = new Date(entry.timestamp).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} perc`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} óra`;
    return `${hours}ó ${mins}p`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{s?.emoji ?? "❓"}</span>
          <div>
            <div className="font-medium">{s?.name ?? "Ismeretlen"}</div>
            <div className="text-xs text-slate-500">
              {time}
              {entry.duration && <> • {formatDuration(entry.duration)}</>}
            </div>
          </div>
        </div>
        <span className="text-sm px-2 py-1 rounded-lg bg-sky-100 font-semibold">{entry.intensity}</span>
      </div>
      {entry.note && (
        <div className="text-xs text-slate-600 mt-2 pl-11 italic">"{entry.note}"</div>
      )}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

// --- Add Symptom Tab ---
function AddSymptomTab({ onAdd, symptoms, onDelete }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤒");
  const [parentOnly, setParentOnly] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ id: uid(), name: trimmed, emoji, parentOnly });
    setName("");
    setEmoji("🤒");
    setParentOnly(false);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Új tünet hozzáadása" subtitle="Adj nevet és válassz ikont (emoji)." />

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Tünet neve</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="pl. Hasfájás"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
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
            className="w-5 h-5 accent-sky-500"
          />
          <div>
            <span className="text-sm font-medium">Csak szülő módban látható</span>
            <p className="text-xs text-slate-500">Ez a tünet nem jelenik meg a gyerek nézetben</p>
          </div>
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-sky-500 text-white font-semibold py-3 active:scale-[0.99]"
        >
          Hozzáadás
        </button>
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
                <button
                  onClick={() => onDelete(s.id)}
                  className="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 text-sm font-medium"
                >
                  Törlés
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <HintCard />
    </div>
  );
}

function HintCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
      💡 Tipp: A főlistán gyorsan rögzíthetsz – koppints a tünet kártyájára, állítsd a csúszkát, majd mentés.
    </div>
  );
}

// --- Stats Tab ---
function StatsTab({ entries, symptoms }) {
  // Készítsünk 7 napos idősor adatot a teljes napi össz-intenzitásra
  const data7 = useMemo(() => buildWeeklyData(entries), [entries]);

  return (
    <div className="space-y-4">
      <SectionTitle title="Heti trend" subtitle="Az elmúlt 7 nap össz-intenzitása (összes tünet)." />
      <div className="h-64 rounded-2xl border border-slate-200 bg-white p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data7}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#38bdf8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <PerSymptomBreakdown entries={entries} symptoms={symptoms} />
    </div>
  );
}

function buildWeeklyData(entries) {
  // Past 6 days + today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    return { key, label, total: 0 };
  });
  const map = Object.fromEntries(days.map((d) => [d.key, d]));
  for (const e of entries) {
    if (map[e.date]) map[e.date].total += Number(e.intensity) || 0;
  }
  return days;
}

function PerSymptomBreakdown({ entries, symptoms }) {
  // Napi átlag erősség tünetenként (elmúlt 7 nap)
  const startKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  })();

  const per = symptoms.map((s) => {
    const last7 = entries.filter((e) => e.symptomId === s.id && e.date >= startKey);
    if (last7.length === 0) return { name: s.name, emoji: s.emoji, avg: 0 };
    const avg = Math.round((last7.reduce((a, b) => a + (b.intensity || 0), 0) / last7.length) * 10) / 10;
    return { name: s.name, emoji: s.emoji, avg };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <h3 className="font-semibold">Átlag erősség tünetenként (7 nap)</h3>
      <ul className="space-y-2">
        {per.map((r, i) => (
          <li key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <span>{r.name}</span>
            </div>
            <span className="text-sm px-2 py-1 rounded-lg bg-indigo-50">{r.avg}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Manage Entries Tab (Parent Only) ---
function ManageEntriesTab({ entries, symptoms, onDelete }) {
  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} perc`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} óra`;
    return `${hours}ó ${mins}p`;
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="Összes bejegyzés" subtitle="Szerkeszt vagy töröl bejegyzéseket." />
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">Még nincs rögzített bejegyzés.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const symptom = symptoms.find((s) => s.id === entry.symptomId);
            const time = new Date(entry.timestamp).toLocaleTimeString("hu-HU", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{symptom?.emoji ?? "❓"}</span>
                    <div>
                      <div className="font-medium">{symptom?.name ?? "Ismeretlen"}</div>
                      <div className="text-xs text-slate-500">
                        {entry.date} • {time}
                        {entry.duration && <> • {formatDuration(entry.duration)}</>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 text-sm"
                  >
                    Törlés
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Erősség:</span>
                  <span className="text-sm px-2 py-0.5 rounded-lg bg-sky-100 font-semibold">
                    {entry.intensity}/10
                  </span>
                </div>
                {entry.note && (
                  <div className="text-xs text-slate-600 mt-2 italic">"{entry.note}"</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Export Tab (Parent Only) ---
function ExportTab({ entries, symptoms }) {
  const exportCSV = () => {
    const header = "Dátum,Idő,Tünet,Erősség,Időtartam (perc),Jegyzet\n";
    const rows = entries.map((e) => {
      const s = symptoms.find((sym) => sym.id === e.symptomId);
      const time = new Date(e.timestamp).toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${e.date},${time},"${s?.name ?? "Ismeretlen"}",${e.intensity},${e.duration || ""},${e.note || ""}`;
    }).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tunetnaplo_${todayISO()}.csv`;
    link.click();
  };

  const exportPDF = () => {
    // Simple HTML print for now - could be enhanced with jsPDF library
    const printWindow = window.open("", "", "width=800,height=600");
    const content = `
      <html>
        <head>
          <title>Tünetnapló - ${todayISO()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>🧸 Tünetnapló</h1>
          <p>Export dátuma: ${new Date().toLocaleDateString("hu-HU")}</p>
          <table>
            <thead>
              <tr>
                <th>Dátum</th>
                <th>Idő</th>
                <th>Tünet</th>
                <th>Erősség</th>
                <th>Időtartam</th>
                <th>Jegyzet</th>
              </tr>
            </thead>
            <tbody>
              ${entries
                .map((e) => {
                  const s = symptoms.find((sym) => sym.id === e.symptomId);
                  const time = new Date(e.timestamp).toLocaleTimeString("hu-HU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const duration = e.duration
                    ? e.duration < 60
                      ? `${e.duration} perc`
                      : `${Math.floor(e.duration / 60)} óra`
                    : "-";
                  return `
                    <tr>
                      <td>${e.date}</td>
                      <td>${time}</td>
                      <td>${s?.emoji} ${s?.name ?? "Ismeretlen"}</td>
                      <td>${e.intensity}/10</td>
                      <td>${duration}</td>
                      <td>${e.note || "-"}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Adatok exportálása" subtitle="Mentsd el a tüneteket orvosi vizithez." />

      <div className="space-y-3">
        <button
          onClick={exportCSV}
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 flex items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition"
        >
          <span className="text-3xl">📊</span>
          <div className="text-left flex-1">
            <div className="font-semibold">CSV Export</div>
            <div className="text-sm text-slate-500">Excel / Google Sheets formátum</div>
          </div>
        </button>

        <button
          onClick={exportPDF}
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 flex items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition"
        >
          <span className="text-3xl">📄</span>
          <div className="text-left flex-1">
            <div className="font-semibold">PDF Export</div>
            <div className="text-sm text-slate-500">Nyomtatható riport</div>
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p className="font-medium mb-2">📋 Exportált adatok:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Összes bejegyzés ({entries.length} db)</li>
          <li>Dátum, idő, tünet név</li>
          <li>Erősség és időtartam</li>
          <li>Jegyzetek</li>
        </ul>
      </div>
    </div>
  );
}

// --- Log Modal ---
function LogModal({ symptom, intensity, setIntensity, duration, setDuration, note, setNote, onClose, onSave }) {
  const durationPresets = [
    { label: "5 perc", value: 5 },
    { label: "15 perc", value: 15 },
    { label: "30 perc", value: 30 },
    { label: "1 óra", value: 60 },
    { label: "2+ óra", value: 120 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{symptom.emoji}</span>
          <h3 className="text-lg font-semibold">{symptom.name}</h3>
        </div>

        <label className="block mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Erősség</span>
            <span className="text-sm bg-sky-100 px-2 py-0.5 rounded-lg">{intensity}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="w-full accent-sky-500"
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
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-white text-slate-700 border-slate-300 hover:border-sky-300"
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
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-sky-300 text-sm"
          />
        </div>

        <label className="block mb-4">
          <span className="text-sm font-medium">Jegyzet (opcionális)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rövid megjegyzés..."
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300 min-h-[80px]"
          />
        </label>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-slate-300 py-3">Mégse</button>
          <button onClick={onSave} className="flex-1 rounded-2xl bg-sky-500 text-white font-semibold py-3">Mentés</button>
        </div>
      </div>
    </div>
  );
}
