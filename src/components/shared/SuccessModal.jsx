import React, { useEffect } from "react";

export default function SuccessModal({ isOpen, onClose, autoDismissMs = 1500 }) {
  useEffect(() => {
    if (isOpen && autoDismissMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDismissMs, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-4 animate-fade-in"
        onClick={onClose}
      >
        {/* Animated checkmark */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <p className="text-lg font-medium text-slate-700">
          Feljegyeztuk.
        </p>
      </div>
    </div>
  );
}
