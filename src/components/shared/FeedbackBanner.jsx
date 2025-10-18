import React from 'react';

const FEEDBACK_EMAIL = (import.meta.env.VITE_FEEDBACK_EMAIL || "").trim();
const FEEDBACK_FORM_URL = (import.meta.env.VITE_FEEDBACK_FORM_URL || "").trim();
const FEEDBACK_LINK = (() => {
  if (FEEDBACK_EMAIL) {
    const subject = encodeURIComponent("Tünetnapló teszt visszajelzés");
    return `mailto:${FEEDBACK_EMAIL}?subject=${subject}`;
  }
  return FEEDBACK_FORM_URL;
})();

export default function FeedbackBanner({ variant = "parent" }) {
  if (!FEEDBACK_LINK) {
    return null;
  }

  const isParent = variant === "parent";
  const message = isParent
    ? "Segítsd a fejlesztést: oszd meg, mi működik jól és mi szorul javításra."
    : "Szólj a szülőnek, vagy küldjetek visszajelzést, ha valami nem működik.";
  const actionLabel = FEEDBACK_EMAIL ? "Visszajelzés e-mailben" : "Visszajelzés küldése";
  const linkProps = FEEDBACK_LINK.startsWith("http")
    ? { href: FEEDBACK_LINK, target: "_blank", rel: "noopener noreferrer" }
    : { href: FEEDBACK_LINK };

  return (
    <div className={`mt-6 ${isParent ? "" : "mt-8"}`}>
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
        <p className="mb-3 font-medium">{message}</p>
        <a
          {...linkProps}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
}
