import React from "react";
import ManageEntriesTab from "./ManageEntriesTab";

// DiaryTab is just a renamed wrapper around ManageEntriesTab
// This keeps the 3-tab naming consistent: Home, Diary, Analytics
export default function DiaryTab({ entries, symptoms, onDelete, onEdit, onBulkDelete }) {
  return (
    <ManageEntriesTab
      entries={entries}
      symptoms={symptoms}
      onDelete={onDelete}
      onEdit={onEdit}
      onBulkDelete={onBulkDelete}
    />
  );
}
