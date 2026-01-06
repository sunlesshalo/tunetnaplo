import React, { useState } from "react";
import SectionTitle from "../../shared/SectionTitle";
import { generateMedicalPDF } from "../../../utils/pdfExport";
import { todayISO } from "../../../utils/constants";
import { deleteAllData } from "../../../services/googleSheetsService";

export default function ExportTab({ entries, symptoms }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleResetData = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    // Double confirmation with prompt
    const confirmText = window.prompt(
      'Ez MINDEN adatot töröl (tünetek, bejegyzések, fotók, hangfelvételek, beállítások).\n\nÍrd be: "TÖRLÉS" a megerősítéshez:'
    );

    if (confirmText !== "TÖRLÉS") {
      setShowResetConfirm(false);
      return;
    }

    setIsDeleting(true);
    setResetError("");

    const result = await deleteAllData();

    if (result.success) {
      // Sign out and reload to start fresh
      if (window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(
          window.gapi?.auth?.getToken()?.access_token,
          () => {}
        );
      }
      window.location.href = "/";
    } else {
      setResetError(result.error || "Hiba történt a törlés közben");
      setIsDeleting(false);
      setShowResetConfirm(false);
    }
  };
  const exportCSV = () => {
    const header = "Dátum,Idő,Tünet,Erősség,Időtartam (perc),Jegyzet,Hangulat,Energia,Tevékenység,Étel,Gyógyszer,Időszak,Hőmérséklet,Időjárás,Légnyomás,Helyszín\n";
    const rows = entries.map((e) => {
      const s = symptoms.find((sym) => sym.id === (e.symptom_id || e.symptomId));
      const time = new Date(e.timestamp).toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const context = e.context || {};
      const env = e.environment || {};
      const weather = env.weather || {};
      const location = env.location ? `${env.location.lat.toFixed(4)}, ${env.location.lng.toFixed(4)}` : "";
      const timeOfDay = env.timeOfDay ? `${env.timeOfDay}h` : "";

      return `${e.date},${time},"${s?.name ?? "Ismeretlen"}",${e.intensity},${e.duration || ""},${e.note || ""},${context.mood || ""},${context.energy || ""},${context.activity || ""},${context.food || ""},${context.medication || ""},${timeOfDay},${weather.temp ? weather.temp + "°C" : ""},${weather.condition || ""},${weather.pressure ? weather.pressure + " hPa" : ""},${location}`;
    }).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tunetnaplo_${todayISO()}.csv`;
    link.click();
  };

  const exportPDF = () => {
    generateMedicalPDF(entries, symptoms);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Adatok exportálása" subtitle="Mentsd el a tüneteket orvosi vizithez." />

      <div className="space-y-3">
        <button
          onClick={exportCSV}
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 flex items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition"
        >
          <span className="text-3xl">📊</span>
          <div className="text-left flex-1">
            <div className="font-semibold">CSV Export</div>
            <div className="text-sm text-slate-500">Excel / Google Sheets formátum</div>
          </div>
        </button>

        <button
          onClick={exportPDF}
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 flex items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition"
        >
          <span className="text-3xl">📄</span>
          <div className="text-left flex-1">
            <div className="font-semibold">PDF Export</div>
            <div className="text-sm text-slate-500">Nyomtatható riport</div>
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p className="font-medium mb-2">📋 Exportált adatok:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Összes bejegyzés ({entries.length} db)</li>
          <li>Dátum, idő, tünet név</li>
          <li>Erősség és időtartam</li>
          <li>Jegyzetek és kontextus (hangulat, energia, tevékenység)</li>
          <li>Étel és gyógyszer (ha van)</li>
          <li>Környezeti adatok (időjárás, hőmérséklet, légnyomás, helyszín)</li>
        </ul>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 pt-6 border-t border-red-200">
        <SectionTitle title="Veszélyzóna" subtitle="Visszafordíthatatlan műveletek" />

        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 space-y-4">
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-2">Minden adat törlése</p>
            <p className="text-xs text-red-600">
              Ez törli a Google Drive-on tárolt összes adatot (Tünetnapló mappa,
              tünetek, bejegyzések, fotók, hangfelvételek) és az eszközön tárolt
              beállításokat (téma, PIN, biometrikus beállítás).
            </p>
          </div>

          {resetError && (
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded-lg">
              {resetError}
            </p>
          )}

          <button
            onClick={handleResetData}
            disabled={isDeleting}
            className={`w-full rounded-xl py-3 font-medium transition-colors ${
              showResetConfirm
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-100 hover:bg-red-200 text-red-700"
            } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isDeleting
              ? "Törlés folyamatban..."
              : showResetConfirm
              ? "Kattints újra a végleges törléshez"
              : "Minden adat törlése"}
          </button>

          {showResetConfirm && (
            <button
              onClick={() => setShowResetConfirm(false)}
              className="w-full rounded-xl py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Mégse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
