import { useState } from 'react';

const todayISO = () => new Date().toISOString().slice(0, 10);

export function useEntryModal({
  symptoms,
  addEntry,
  updateEntry,
  getEnvironment,
  isParentMode = false,
  allowSymptomChangeOnEdit = true,
  errorLabels = {
    create: 'Hiba a mentésnél',
    update: isParentMode ? 'Hiba a módosításnál' : 'Hiba a mentésnél',
  },
}) {
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState('');
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState('');
  const [activity, setActivity] = useState('');
  const [foodNote, setFoodNote] = useState('');
  const [medicationNote, setMedicationNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [voiceNote, setVoiceNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setIntensity(5);
    setNote('');
    setDuration('');
    setMood('');
    setEnergy('');
    setActivity('');
    setFoodNote('');
    setMedicationNote('');
    setPhotos([]);
    setVoiceNote(null);
    setIsSaving(false);
  };

  const openLogModal = (symptom) => {
    setActiveSymptom(symptom);
    setEditingEntry(null);
    resetForm();
  };

  const openEditModal = (entry) => {
    const symptom = symptoms.find((s) => s.id === (entry.symptom_id || entry.symptomId));
    const fallbackSymptom =
      symptom || {
        id: entry.symptom_id || entry.symptomId,
        name: entry.symptom_name || "Ismeretlen",
        emoji: entry.symptom_emoji || "❓",
      };

    setActiveSymptom(fallbackSymptom);
    setEditingEntry(entry);
    setIntensity(entry.intensity ?? 5);
    setNote(entry.note || '');
    setDuration(entry.duration ? entry.duration.toString() : '');

    const context = entry.context || {};
    setMood(context.mood || '');
    setEnergy(context.energy || '');
    setActivity(context.activity || '');
    setFoodNote(context.food || '');
    setMedicationNote(context.medication || '');

    setPhotos(entry.photos || []);
    setVoiceNote(entry.voice_note || null);
  };

  const closeLogModal = () => {
    setActiveSymptom(null);
    setEditingEntry(null);
    setIsSaving(false);
  };

  const buildContext = () => {
    const base = {
      mood: mood || null,
      energy: energy || null,
      activity: activity || null,
    };

    if (isParentMode) {
      return {
        ...base,
        food: foodNote.trim() || null,
        medication: medicationNote.trim() || null,
      };
    }

    return base;
  };

  const buildMedia = () => ({
    photos: photos.length > 0 ? photos : null,
    voice_note: voiceNote,
  });

  const saveEntry = async () => {
    if (!activeSymptom) {
      return { error: `${errorLabels.create}: nincs kiválasztott tünet` };
    }

    if (isSaving) {
      return { error: null };
    }

    setIsSaving(true);

    if (!editingEntry) {
      try {
        const environment = typeof getEnvironment === 'function' ? await getEnvironment() : null;
        const payload = {
          date: todayISO(),
          timestamp: new Date().toISOString(),
          symptom_id: activeSymptom.id,
          intensity: Number(intensity),
          duration: duration ? Number(duration) : null,
          note: note.trim(),
          environment,
          context: buildContext(),
          ...buildMedia(),
        };

        const { error } = await addEntry(payload);
        if (error) {
          return { error: `${errorLabels.create}: ${error}` };
        }

        closeLogModal();
        return { error: null };
      } finally {
        setIsSaving(false);
      }
    }

    try {
      const payload = {
        intensity: Number(intensity),
        duration: duration ? Number(duration) : null,
        note: note.trim(),
        context: buildContext(),
        ...buildMedia(),
      };

      if (allowSymptomChangeOnEdit) {
        payload.symptom_id = activeSymptom.id;
      }

      const { error } = await updateEntry(editingEntry.id, payload);
      if (error) {
        return { error: `${errorLabels.update}: ${error}` };
      }

      closeLogModal();
      return { error: null };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeSymptom,
    editingEntry,
    intensity,
    setIntensity,
    note,
    setNote,
    duration,
    setDuration,
    mood,
    setMood,
    energy,
    setEnergy,
    activity,
    setActivity,
    foodNote,
    setFoodNote,
    medicationNote,
    setMedicationNote,
    photos,
    setPhotos,
    voiceNote,
    setVoiceNote,
    openLogModal,
    openEditModal,
    closeLogModal,
    saveEntry,
    isSaving,
  };
}
