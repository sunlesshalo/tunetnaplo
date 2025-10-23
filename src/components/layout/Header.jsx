import React from "react";
import { Link } from "react-router-dom";
import { signOut } from "../../googleClient";

export default function Header({ isChild, session }) {
  const handleSignOut = async () => {
    await signOut();
    window.location.reload(); // Reload to clear state
  };

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
        <div className="flex items-center gap-2">
          {!isChild && (
            <Link to="/" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
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
