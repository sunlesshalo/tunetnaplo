import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../googleClient';
import { shareWithParent, getSharedUsers, removeSharedUser } from '../../services/googleDriveService';
import FeedbackModal from './FeedbackModal';

/**
 * Settings modal for Parent mode
 * Simple flat list: sharing + actions
 */
export default function ParentSettingsModal({
  isOpen,
  onClose,
  spreadsheetId,
}) {
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);

  // Sharing state
  const [email, setEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');

  // Load shared users
  useEffect(() => {
    if (isOpen && spreadsheetId) {
      loadSharedUsers();
    }
  }, [isOpen, spreadsheetId]);

  const loadSharedUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await getSharedUsers(spreadsheetId);
      setSharedUsers(users);
    } catch (err) {
      console.error('Error loading shared users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setShareError('Kérlek adj meg egy érvényes email címet');
      return;
    }

    setLoadingShare(true);
    setShareError('');
    setShareSuccess('');

    try {
      const result = await shareWithParent(spreadsheetId, email);
      if (result.success) {
        setEmail('');
        setShareSuccess('Meghívó elküldve!');
        await loadSharedUsers();
        setTimeout(() => setShareSuccess(''), 3000);
      } else {
        setShareError(result.error || 'Nem sikerült meghívni');
      }
    } catch (err) {
      setShareError('Nem sikerült meghívni');
    } finally {
      setLoadingShare(false);
    }
  };

  const handleRemoveUser = async (permissionId, userEmail) => {
    if (!window.confirm(`Biztosan eltávolítod: ${userEmail}?`)) return;

    try {
      await removeSharedUser(spreadsheetId, permissionId);
      await loadSharedUsers();
    } catch (err) {
      setShareError('Nem sikerült eltávolítani');
    }
  };

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
        <div className="p-5 pb-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Beállítások</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Invite parent section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span>👨‍👩‍👧</span>
              Másik szülő meghívása
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              A másik szülő is láthatja és szerkesztheti az adatokat.
            </p>

            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setShareError('');
                }}
                placeholder="Email cím..."
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme"
              />
              <button
                type="submit"
                disabled={loadingShare || !email}
                className="px-4 py-2 rounded-xl bg-theme text-white font-medium text-sm hover:bg-theme-dark disabled:opacity-50 transition-colors"
              >
                {loadingShare ? '...' : 'Meghívás'}
              </button>
            </form>

            {shareError && (
              <p className="text-red-500 text-xs mt-2">⚠️ {shareError}</p>
            )}
            {shareSuccess && (
              <p className="text-green-600 text-xs mt-2">✅ {shareSuccess}</p>
            )}

            {/* Shared users */}
            {!loadingUsers && sharedUsers.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs text-slate-400">Megosztva:</p>
                {sharedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm"
                  >
                    <span className="text-slate-700">{user.email}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id, user.email)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Actions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSwitchToChild}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-theme/10 hover:bg-theme/20 transition-colors"
            >
              <span className="text-xl">🧸</span>
              <span className="font-medium text-theme">Gyerek mód</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFeedback(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span className="text-xl">💬</span>
              <span className="font-medium text-slate-700">Visszajelzés küldése</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium text-red-600">Kilépés</span>
            </button>
          </div>
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
