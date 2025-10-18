import React from "react";
import EntriesSection from "../../entries/EntriesSection";

export default function ManageEntriesTab({ entries, symptoms, onDelete, onEdit, onBulkDelete }) {
  return (
    <EntriesSection
      entries={entries}
      symptoms={symptoms}
      title="Összes bejegyzés"
      subtitle="Szerkeszd vagy töröld a bejegyzéseket, szűrve az időszak szerint."
      onEdit={onEdit}
      onDelete={onDelete}
      showDate={true}
      compactButtons={true}
      defaultFilter="7"
      selectable={true}
      onBulkDelete={onBulkDelete}
    />
  );
}
