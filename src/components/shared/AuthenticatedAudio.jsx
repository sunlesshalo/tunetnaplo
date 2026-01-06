import React, { useState, useEffect } from 'react';
import { getAuthenticatedBlobUrl } from '../../services/googleDriveService';

export default function AuthenticatedAudio({ fileId, className }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileId) return;

    setLoading(true);
    setError(false);

    getAuthenticatedBlobUrl(fileId)
      .then(url => {
        setAudioUrl(url);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [fileId]);

  if (loading) {
    return <span className="text-xs text-slate-500">Betoltes...</span>;
  }

  if (error || !audioUrl) {
    return <span className="text-xs text-slate-500">Nem sikerult betolteni</span>;
  }

  return (
    <audio
      controls
      src={audioUrl}
      className={className}
    />
  );
}
