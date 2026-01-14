import React, { useState } from 'react';

/**
 * Feedback modal for collecting user feedback
 * Sends to Formspree endpoint (email not exposed in frontend)
 */
export default function FeedbackModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const formspreeId = import.meta.env.VITE_FORMSPREE_ID;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setErrorMessage('Kérlek írj egy üzenetet.');
      return;
    }

    if (!formspreeId) {
      setErrorMessage('A visszajelzés funkció nincs beállítva.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim() || 'Nem adott meg email címet',
          message: message.trim(),
          _subject: 'Tünetnapló visszajelzés',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Hiba történt a küldés során');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setStatus('error');
      setErrorMessage('Nem sikerült elküldeni. Próbáld újra később.');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setEmail('');
    setMessage('');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Visszajelzés</h2>
        <p className="text-sm text-slate-500 mb-6">
          Örülünk, ha megosztod velünk a véleményed vagy ötleteidet!
        </p>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">💌</div>
            <p className="text-lg font-medium text-slate-700 mb-2">
              Köszönjük a visszajelzést!
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Hamarosan átnézzük az üzeneted.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl bg-theme text-white py-3 px-8 font-semibold hover:bg-theme-dark"
            >
              Bezárás
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Email field (optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email cím (opcionális)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelda@email.hu"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme"
                disabled={status === 'sending'}
              />
              <p className="text-xs text-slate-400 mt-1">
                Add meg, ha szeretnéd, hogy válaszoljunk
              </p>
            </div>

            {/* Message field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Üzenet *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mi a véleményed? Van ötleted? Találtál hibát?"
                rows={5}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-theme resize-none"
                disabled={status === 'sending'}
              />
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border border-slate-300 py-3 font-medium"
                disabled={status === 'sending'}
              >
                Mégse
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-theme text-white py-3 font-semibold hover:bg-theme-dark disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Küldés...' : 'Küldés'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
