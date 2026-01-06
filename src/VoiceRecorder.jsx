import React, { useState, useRef, useEffect } from 'react';
import { uploadVoiceNote, deleteVoiceNote } from './utils/storageHelpers';
import { getAuthenticatedBlobUrl } from './services/googleDriveService';

export default function VoiceRecorder({ userId, voiceNotePath, onChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Fetch authenticated audio URL when voiceNotePath changes
  useEffect(() => {
    if (voiceNotePath) {
      setLoadingAudio(true);
      getAuthenticatedBlobUrl(voiceNotePath)
        .then(url => {
          setAudioUrl(url);
          setLoadingAudio(false);
        })
        .catch(err => {
          console.error('Failed to load audio:', err);
          setLoadingAudio(false);
        });
    } else {
      setAudioUrl(null);
    }

    // Cleanup blob URL on unmount or when path changes
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [voiceNotePath]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect iOS/Safari - they need special handling
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      // Determine best MIME type for the platform
      let mimeType = null;
      let recorderOptions = {};

      if (isIOS || isSafari) {
        // iOS Safari: try mp4 first, or let browser decide
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        }
        // If nothing supported, don't specify mimeType - let browser choose
        if (mimeType) {
          recorderOptions = { mimeType };
        }
      } else {
        // Chrome/Firefox/Android - prefer webm/opus
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
        if (mimeType) {
          recorderOptions = { mimeType };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      // Get actual mimeType from recorder (may differ from requested)
      const actualMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Use the actual mimeType from the recorder, or from first chunk
        const blobType = actualMimeType ||
          (chunksRef.current[0]?.type) ||
          'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: blobType });
        stream.getTracks().forEach(track => track.stop());

        if (audioBlob.size === 0) {
          alert('A felvétel üres. Kérlek próbáld újra!');
          return;
        }

        // Upload the recording
        setUploading(true);
        const result = await uploadVoiceNote(audioBlob, userId);
        setUploading(false);

        if (result.error) {
          alert(`Hiba a hangfelvétel feltöltésekor: ${result.error}`);
        } else {
          onChange(result.path);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

    } catch (error) {
      alert('Nem sikerült elindítani a felvételt. Kérlek engedélyezd a mikrofon használatát!');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Biztosan törlöd a hangfelvételt?')) return;

    await deleteVoiceNote(voiceNotePath);
    onChange(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">Hangfelvétel 🎤</span>

      {!voiceNotePath && !uploading && (
        <div>
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
            >
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Felvétel indítása
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <span className="w-3 h-3 bg-white rounded-sm"></span>
                Leállítás
              </button>
              <span className="text-sm font-mono text-slate-600">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-slate-600">Feltöltés...</div>
      )}

      {voiceNotePath && !uploading && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          {loadingAudio ? (
            <span className="text-sm text-slate-500">Betöltés...</span>
          ) : audioUrl ? (
            <audio
              controls
              src={audioUrl}
              className="flex-1 h-10"
            />
          ) : (
            <span className="text-sm text-slate-500">Nem sikerült betölteni</span>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 text-sm px-2"
          >
            Törlés
          </button>
        </div>
      )}
    </div>
  );
}
