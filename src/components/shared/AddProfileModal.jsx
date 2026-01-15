import React, { useState } from 'react';

const AVATAR_EMOJIS = ['🧒', '👧', '👦', '👶', '🧒🏻', '👧🏻', '👦🏻', '🧒🏽', '👧🏽', '👦🏽', '🧒🏿', '👧🏿', '👦🏿'];

/**
 * Modal for adding a new child profile
 */
export default function AddProfileModal({ isOpen, onClose, onAdd, isLoading }) {
  const [name, setName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🧒');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Kérlek add meg a gyermek nevét');
      return;
    }

    setError('');
    const result = await onAdd({
      name: name.trim(),
      avatar_emoji: avatarEmoji,
      theme: 'sky',
    });

    if (result?.error) {
      setError(result.error);
    } else {
      // Success - reset form and close
      setName('');
      setAvatarEmoji('🧒');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-center text-slate-800 mb-4">
          Új gyermek hozzáadása
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Gyermek neve
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Pl. Mia"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Avatar picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Válassz avatart
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all ${
                    avatarEmoji === emoji
                      ? 'bg-theme/20 ring-2 ring-theme scale-110'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-theme text-white font-medium hover:bg-theme-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Mentés...' : 'Hozzáadás'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
