import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../googleClient';
import ShareSettingsSection from './ShareSettingsSection';
import FeedbackModal from './FeedbackModal';

/**
 * Settings modal for Parent mode
 * Includes sharing settings, profile management, and navigation
 */
export default function ParentSettingsModal({
  isOpen,
  onClose,
  spreadsheetId,
  activeProfile,
  profiles,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSwitchToChild = () => {
    onClose();
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Beállítások</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              aria-label="Bezárás"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'general'
                  ? 'bg-theme text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Általános
            </button>
            <button
              onClick={() => setActiveTab('sharing')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'sharing'
                  ? 'bg-theme text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Megosztás
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Current profile info */}
              {activeProfile && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-slate-500 mb-2">Aktív profil</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeProfile.avatar_emoji || '🧒'}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{activeProfile.name}</p>
                      <p className="text-sm text-slate-500">
                        {profiles.length} profil összesen
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Spreadsheet info */}
              {spreadsheetId && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-slate-500 mb-2">Adattárolás</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <div>
                      <p className="text-sm text-slate-700">Google Táblázat</p>
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-theme hover:underline"
                      >
                        Megnyitás Google Táblázatban →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex gap-2">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Tudtad?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Az adataid a saját Google fiókodban tárolódnak.
                      Senki más nem fér hozzájuk, hacsak meg nem osztod velük.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sharing' && (
            <ShareSettingsSection spreadsheetId={spreadsheetId} />
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-6 pt-4 border-t border-slate-200 space-y-3">
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSwitchToChild}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-theme/10 hover:bg-theme/20 py-3 font-medium text-theme transition-colors"
            >
              <span>🧸</span>
              Gyerek mód
            </button>
            <button
              type="button"
              onClick={() => setShowFeedback(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 font-medium text-slate-700 transition-colors"
            >
              <span>💬</span>
              Visszajelzés
            </button>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 py-3 font-medium text-red-600 transition-colors"
          >
            <span>🚪</span>
            Kilépés
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
}
