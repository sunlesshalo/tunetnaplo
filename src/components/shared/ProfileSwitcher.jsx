import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown component for parents to switch between child profiles
 * Shows in the parent view header
 */
export default function ProfileSwitcher({
  profiles,
  activeProfile,
  onSelect,
  onAddProfile,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasMultipleProfiles = profiles && profiles.length > 1;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
      >
        <span className="text-lg">{activeProfile?.avatar_emoji || '🧒'}</span>
        <span className="font-medium text-white">{activeProfile?.name || 'Gyermek'}</span>
        <span className="text-xs text-white/70">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl py-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
            {hasMultipleProfiles ? 'Gyermekek' : 'Aktív profil'}
          </div>

          {profiles?.map((profile) => (
            <button
              key={profile.id}
              onClick={() => {
                onSelect(profile);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors ${
                activeProfile?.id === profile.id ? 'bg-theme/10' : ''
              }`}
            >
              <span className="text-xl">{profile.avatar_emoji || '🧒'}</span>
              <span className="flex-1 text-left font-medium text-slate-700">
                {profile.name}
              </span>
              {activeProfile?.id === profile.id && (
                <span className="text-theme">✓</span>
              )}
            </button>
          ))}

          {onAddProfile && (
            <>
              <div className="border-t border-slate-100 my-2" />
              <button
                onClick={() => {
                  onAddProfile();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-theme hover:bg-theme/5 transition-colors"
              >
                <span className="text-xl">➕</span>
                <span className="font-medium">Új gyermek hozzáadása</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
