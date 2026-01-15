import React, { useState, useEffect } from 'react';
import {
  shareWithParent,
  getSharedUsers,
  removeSharedUser,
} from '../../services/googleDriveService';

/**
 * Settings section for parents to share data with another parent
 * Shows in parent settings modal
 */
export default function ShareSettingsSection({ spreadsheetId }) {
  const [email, setEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load shared users on mount
  useEffect(() => {
    if (spreadsheetId) {
      loadSharedUsers();
    }
  }, [spreadsheetId]);

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
      setError('Kérlek adj meg egy érvényes email címet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await shareWithParent(spreadsheetId, email);
      if (result.success) {
        setEmail('');
        setSuccess('Meghívó elküldve!');
        await loadSharedUsers();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Nem sikerült meghívni');
      }
    } catch (err) {
      setError('Nem sikerült meghívni a felhasználót');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (permissionId, userEmail) => {
    if (!window.confirm(`Biztosan eltávolítod a hozzáférést: ${userEmail}?`)) {
      return;
    }

    try {
      const result = await removeSharedUser(spreadsheetId, permissionId);
      if (result.success) {
        await loadSharedUsers();
      } else {
        setError(result.error || 'Nem sikerült eltávolítani');
      }
    } catch (err) {
      setError('Nem sikerült eltávolítani');
    }
  };

  return (
    <div className="mb-6 pt-4 border-t border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <span>👨‍👩‍👧</span>
        Megosztás másik szülővel
      </h3>

      <p className="text-xs text-slate-500 mb-3">
        Add meg a másik szülő email címét, hogy ő is lássa és szerkeszthesse a gyermekek adatait.
      </p>

      <form onSubmit={handleInvite} className="flex gap-2 mb-3">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="Email cím..."
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="px-4 py-2 rounded-xl bg-theme text-white font-medium text-sm hover:bg-theme-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '...' : 'Meghívás'}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 text-sm mb-3 flex items-center gap-1">
          <span>✅</span> {success}
        </p>
      )}

      {/* Shared users list */}
      {loadingUsers ? (
        <p className="text-xs text-slate-400">Betöltés...</p>
      ) : sharedUsers.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium">Megosztva:</p>
          {sharedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="text-sm text-slate-700">{user.email}</span>
              </div>
              <button
                onClick={() => handleRemoveUser(user.id, user.email)}
                className="text-red-500 text-xs hover:text-red-700 hover:underline transition-colors"
              >
                Eltávolítás
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          Még nincs megosztva senkivel
        </p>
      )}
    </div>
  );
}
