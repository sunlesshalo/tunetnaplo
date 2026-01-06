import React, { useMemo, useState } from "react";
import Header from "../layout/Header";
import HomeTab from "./HomeTab";
import LogModal from "../entries/LogModal";
import FeedbackBanner from "../shared/FeedbackBanner";
import SuccessModal from "../shared/SuccessModal";
import SettingsModal from "../shared/SettingsModal";
import { useSymptoms, useEntries } from "../../hooks/useGoogleData";
import { useEntryModal } from "../../hooks/useEntryModal";
import { useSettings } from "../../hooks/useSettings";
import { captureEnvironment, confirmDeleteEntry } from "../../utils/helpers";

export default function ChildView({ session }) {
  const userId = session?.user?.id;

  // Settings (theme, name, PIN)
  const { theme, userName, parentPin, setTheme, setUserName, setParentPin, themes } = useSettings();

  // Modal states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Use Google Sheets hooks for data
  const { symptoms: allSymptoms } = useSymptoms(userId);
  const { entries, addEntry, updateEntry, deleteEntry: deleteEntryDB } = useEntries(userId);

  // Filter out parent-only symptoms
  const symptoms = useMemo(() => {
    return allSymptoms.filter(s => !s.parentOnly);
  }, [allSymptoms]);

  const {
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
    photos,
    setPhotos,
    voiceNote,
    setVoiceNote,
    openLogModal,
    openEditModal,
    closeLogModal,
    saveEntry,
    isSaving,
  } = useEntryModal({
    symptoms: allSymptoms,
    addEntry,
    updateEntry,
    getEnvironment: captureEnvironment,
    isParentMode: false,
    allowSymptomChangeOnEdit: true,
  });

  const handleSaveEntry = async () => {
    const { error } = await saveEntry();
    if (error) {
      alert(error);
    } else {
      // Show success modal
      setShowSuccess(true);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    await confirmDeleteEntry(deleteEntryDB, entryId);
  };

  // Show settings on first use if no name set
  const handleOpenSettings = () => setShowSettings(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-sky-50 text-slate-800 flex flex-col">
      <Header
        isChild={true}
        session={session}
        userName={userName}
        onOpenSettings={handleOpenSettings}
      />
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-6">
        <HomeTab symptoms={symptoms} onLog={openLogModal} entries={entries} onEdit={openEditModal} onDelete={handleDeleteEntry} isParentMode={false} />
        <FeedbackBanner variant="child" />
      </main>

      {activeSymptom && (
        <LogModal
          symptom={activeSymptom}
          intensity={intensity}
          setIntensity={setIntensity}
          duration={duration}
          setDuration={setDuration}
          note={note}
          setNote={setNote}
          mood={mood}
          setMood={setMood}
          energy={energy}
          setEnergy={setEnergy}
          activity={activity}
          setActivity={setActivity}
          photos={photos}
          setPhotos={setPhotos}
          voiceNote={voiceNote}
          setVoiceNote={setVoiceNote}
          userId={userId}
          isParentMode={false}
          isEditing={!!editingEntry}
          onClose={closeLogModal}
          onSave={handleSaveEntry}
          isSaving={isSaving}
        />
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userName={userName}
        setUserName={setUserName}
        theme={theme}
        setTheme={setTheme}
        themes={themes}
        parentPin={parentPin}
        setParentPin={setParentPin}
      />
    </div>
  );
}
