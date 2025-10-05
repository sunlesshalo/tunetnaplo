import React, { useState, useRef, useEffect } from 'react';
import { uploadVoiceNote, deleteVoiceNote } from './storageHelpers';

export default function VoiceRecorder({ userId, voiceNotePath, onChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type (Safari needs different format)
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());

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
          <audio
            controls
            src={`https://tpvgxlobmqoyiaqxdhyf.supabase.co/storage/v1/object/public/voice-notes/${voiceNotePath}`}
            className="flex-1 h-10"
          />
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
