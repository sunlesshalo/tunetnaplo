import React from "react";
import { Link } from "react-router-dom";
import { signOut } from "../../googleClient";
import { getGreeting } from "../../hooks/useSettings";

export default function Header({ isChild, session, userName, onOpenSettings, onOpenFeedback, profileSwitcher }) {
  const handleSignOut = async () => {
    await signOut();
    window.location.reload(); // Reload to clear state
  };

  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-slate-200">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isChild ? "🧸" : "👨‍👩‍👦"}</span>
          <div>
            {isChild && userName ? (
              <>
                <h1 className="text-xl font-bold">{greeting}, {userName}!</h1>
                <p className="text-sm text-slate-500">Tünetnapló</p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold">Tünetnapló</h1>
                <p className="text-sm text-slate-500">
                  {isChild ? "Gyerekbarát gyors rögzítés" : "Szülő mód"}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Profile switcher for parent mode */}
          {!isChild && profileSwitcher}

          {isChild && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              aria-label="Beállítások"
            >
              <span className="text-lg">⚙️</span>
            </button>
          )}
          {!isChild && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              aria-label="Beállítások"
            >
              <span className="text-lg">⚙️</span>
            </button>
          )}
          {!isChild && onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              aria-label="Visszajelzés"
            >
              <span className="text-lg">✉️</span>
            </button>
          )}
          {!isChild && (
            <Link to="/" className="text-sm text-theme hover:text-theme-dark font-medium">
              Gyerek →
            </Link>
          )}
          {!isChild && (
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Kilépés
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
