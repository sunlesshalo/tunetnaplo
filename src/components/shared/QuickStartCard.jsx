import React from 'react';

export default function QuickStartCard({ isParentMode }) {
  const checklist = isParentMode
    ? [
        "Hozz létre 3-5 gyakori tünetet a család számára.",
        "Próbálj ki egy bejegyzés felvételét fényképpel vagy hangjegyzettel.",
        "Nézd meg a Mintázatok fület az összegzéshez.",
      ]
    : [
        "Válassz ki egy tünetet a rögzítéshez.",
        "Add meg az erősséget és egy rövid jegyzetet.",
        "Készíts fotót vagy hangjegyzetet, ha szeretnél.",
      ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
      <h3 className="text-base font-semibold text-slate-700 mb-2">Gyors kezdés</h3>
      <ul className="list-disc list-inside space-y-1">
        {checklist.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
