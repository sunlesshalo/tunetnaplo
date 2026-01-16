import React, { useState } from 'react';
import PatternsTab from '../../stats/PatternsTab';
import ExportTab from './ExportTab';

/**
 * Combined Insights tab with internal tabs for Patterns and Export
 */
export default function InsightsTab({
  entries,
  symptoms,
}) {
  const [activeTab, setActiveTab] = useState(0); // 0: Patterns, 1: Export

  return (
    <div>
      {/* Internal tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 0
              ? 'bg-theme text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Mintázatok
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 1
              ? 'bg-theme text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Export
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <PatternsTab entries={entries} symptoms={symptoms} />
      )}
      {activeTab === 1 && (
        <ExportTab entries={entries} symptoms={symptoms} />
      )}
    </div>
  );
}
