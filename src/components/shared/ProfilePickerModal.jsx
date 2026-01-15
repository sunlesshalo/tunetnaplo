import React from 'react';

/**
 * Modal for children to select their profile when multiple profiles exist
 * Shows a friendly picker with avatar emojis and names
 */
export default function ProfilePickerModal({ isOpen, profiles, onSelect }) {
  if (!isOpen || !profiles?.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-center text-slate-800 mb-2">
          Ki vagy?
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Válaszd ki a neved
        </p>

        <div className="space-y-3">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-theme/10 active:bg-theme/20 transition-colors border-2 border-transparent hover:border-theme/30"
            >
              <span className="text-4xl" role="img" aria-label="Avatar">
                {profile.avatar_emoji || '🧒'}
              </span>
              <div className="flex-1 text-left">
                <span className="text-lg font-semibold text-slate-800">
                  {profile.name}
                </span>
              </div>
              <span className="text-2xl text-slate-300">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
