import React from "react";
import AddSymptomTab from "../symptoms/AddSymptomTab";
import Modal from "./Modal";

export default function ManageSymptomsModal({ isOpen, onClose, onAdd, symptoms, onDelete }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tünetek kezelése">
      <AddSymptomTab onAdd={onAdd} symptoms={symptoms} onDelete={onDelete} />
    </Modal>
  );
}
