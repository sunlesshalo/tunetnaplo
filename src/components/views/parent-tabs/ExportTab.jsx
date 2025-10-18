import React from "react";
import SectionTitle from "../../shared/SectionTitle";
import { generateMedicalPDF } from "../../../utils/pdfExport";
import { todayISO } from "../../../utils/constants";

export default function ExportTab({ entries, symptoms }) {
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
    </div>
  );
}
