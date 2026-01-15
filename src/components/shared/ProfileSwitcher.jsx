import React, { useState, useRef, useEffect } from 'react';

/**
 * Simple child avatar button that opens a modal for switching children
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Child avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        aria-label="Gyermek váltása"
      >
        <span className="text-xl">{activeProfile?.avatar_emoji || '🧒'}</span>
        <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">
          {activeProfile?.name || 'Gyermek'}
        </span>
        <span className="text-xs text-slate-400">▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl py-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
            Gyermekek
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

          <div className="border-t border-slate-100 my-2" />
          <button
            onClick={() => {
              onAddProfile?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-theme hover:bg-theme/5 transition-colors"
          >
            <span className="text-xl">➕</span>
            <span className="font-medium">Új gyermek</span>
          </button>
        </div>
      )}
    </div>
  );
}
