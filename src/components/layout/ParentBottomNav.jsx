import React from "react";

export default function ParentBottomNav({ tab, setTab }) {
  const items = [
    { label: "Gyors rögzítés", icon: "🏠" },
    { label: "Tünetek", icon: "⚙️" },
    { label: "Bejegyzések", icon: "📝" },
    { label: "Mintázatok", icon: "📊" },
    { label: "Export", icon: "📤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex flex-col items-center py-3 text-xs ${
              tab === i ? "font-semibold text-theme" : "text-slate-500"
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
