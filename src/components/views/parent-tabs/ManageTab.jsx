import React, { useState } from 'react';
import AddSymptomTab from '../../symptoms/AddSymptomTab';
import ManageEntriesTab from './ManageEntriesTab';

/**
 * Combined Manage tab with internal tabs for Symptoms and Entries
 */
export default function ManageTab({
  symptoms,
  entries,
  onAddSymptom,
  onUpdateSymptom,
  onDeleteSymptom,
  onEditEntry,
  onDeleteEntry,
  onBulkDeleteEntries,
}) {
  const [activeTab, setActiveTab] = useState(0); // 0: Symptoms, 1: Entries

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
          Tünetek ({symptoms?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 1
              ? 'bg-theme text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Bejegyzések ({entries?.length || 0})
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <AddSymptomTab
          onAdd={onAddSymptom}
          symptoms={symptoms}
          onDelete={onDeleteSymptom}
          onUpdate={onUpdateSymptom}
        />
      )}
      {activeTab === 1 && (
        <ManageEntriesTab
          entries={entries}
          symptoms={symptoms}
          onDelete={onDeleteEntry}
          onEdit={onEditEntry}
          onBulkDelete={onBulkDeleteEntries}
        />
      )}
    </div>
  );
}
