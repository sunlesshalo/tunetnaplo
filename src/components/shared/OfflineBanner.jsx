import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Banner that shows when the user is offline
 * Displays a friendly message in Hungarian
 */
export default function OfflineBanner() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 text-center shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">📡</span>
        <span className="text-sm font-medium">
          Nincs internetkapcsolat. A mentés nem fog működni.
        </span>
      </div>
    </div>
  );
}
