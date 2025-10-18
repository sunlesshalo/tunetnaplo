import React from "react";
import ExportTab from "../views/parent-tabs/ExportTab";
import Modal from "./Modal";

export default function ExportModal({ isOpen, onClose, entries, symptoms }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adatok exportálása">
      <ExportTab entries={entries} symptoms={symptoms} />
    </Modal>
  );
}
