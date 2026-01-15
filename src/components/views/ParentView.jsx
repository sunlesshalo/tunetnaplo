import React, { useState } from "react";
import Header from "../layout/Header";
import ParentBottomNav from "../layout/ParentBottomNav";
import HomeTab from "./HomeTab";
import AddSymptomTab from "../symptoms/AddSymptomTab";
import ManageEntriesTab from "./parent-tabs/ManageEntriesTab";
import PatternsTab from "../stats/PatternsTab";
import ExportTab from "./parent-tabs/ExportTab";
import LogModal from "../entries/LogModal";
import FeedbackBanner from "../shared/FeedbackBanner";
import OfflineBanner from "../shared/OfflineBanner";
import ProfileSwitcher from "../shared/ProfileSwitcher";
import AddProfileModal from "../shared/AddProfileModal";
import ParentSettingsModal from "../shared/ParentSettingsModal";
import { useSymptoms, useEntries } from "../../hooks/useGoogleData";
import { countEntriesForSymptom } from "../../services/googleSheetsService";
import { getSpreadsheetId } from "../../services/googleSheetsService";
import { useEntryModal } from "../../hooks/useEntryModal";
import { useSettings } from "../../hooks/useSettings";
import { useProfiles } from "../../contexts/ProfileContext";
import { captureEnvironment, confirmDeleteEntry } from "../../utils/helpers";

export default function ParentView({ session }) {
  const [tab, setTab] = useState(0); // 0: Főlista, 1: Tünetek, 2: Bejegyzések, 3: Mintázatok, 4: Export
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [addingProfile, setAddingProfile] = useState(false);

  // Use Google Sheets hooks for data
  const userId = session?.user?.id;

  // Profiles - multi-child support
  const { profiles, activeProfile, selectProfile, addProfile, loading: profilesLoading, spreadsheetId } = useProfiles();

  // Apply theme from settings (synced via Google Sheets)
  useSettings(userId);

  // Filter data by active profile
  const {
    symptoms,
    loading: symptomsLoading,
    addSymptom,
    updateSymptom: updateSymptomDB,
    deleteSymptom: deleteSymptomDB
  } = useSymptoms(userId, activeProfile?.id);

  const {
    entries,
    loading: entriesLoading,
    addEntry,
    updateEntry,
    deleteEntry: deleteEntryDB
  } = useEntries(userId, activeProfile?.id);

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
    foodNote,
    setFoodNote,
    medicationNote,
    setMedicationNote,
    photos,
    setPhotos,
    voiceNote,
    setVoiceNote,
    entryDate,
    setEntryDate,
    entryTime,
    setEntryTime,
    openLogModal,
    openEditModal,
    closeLogModal,
    saveEntry,
    isSaving,
  } = useEntryModal({
    symptoms,
    addEntry,
    updateEntry,
    getEnvironment: captureEnvironment,
    isParentMode: true,
    allowSymptomChangeOnEdit: false,
    errorLabels: {
      create: "Hiba a mentésnél",
      update: "Hiba a módosításnál",
    },
  });

  const handleSaveEntry = async () => {
    const { error } = await saveEntry();
    if (error) {
      alert(error);
    }
  };

  const updateSymptom = async (symptomId, updates) => {
    const { error } = await updateSymptomDB(symptomId, updates);
    if (error) {
      alert(`Hiba a módosításnál: ${error}`);
    }
  };

  const deleteSymptom = async (symptomId) => {
    try {
      // Get spreadsheet ID and count related entries
      const spreadsheetId = await getSpreadsheetId(userId);
      const entryCount = await countEntriesForSymptom(spreadsheetId, symptomId);

      // Build warning message
      let message = "Biztosan törölni szeretnéd ezt a tünetet?";
      if (entryCount > 0) {
        message = `Biztosan törölni szeretnéd ezt a tünetet? Ez ${entryCount} bejegyzést is törölni fog.`;
      }

      if (window.confirm(message)) {
        const { error } = await deleteSymptomDB(symptomId);
        if (error) {
          alert(`Hiba a törlésnél: ${error}`);
        }
      }
    } catch (error) {
      alert(`Hiba: ${error.message}`);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    await confirmDeleteEntry(deleteEntryDB, entryId);
  };

  const handleBulkDeleteEntries = async (entryIds) => {
    if (!entryIds?.length) {
      return;
    }

    if (!window.confirm(`Biztosan törlöd a kiválasztott ${entryIds.length} bejegyzést?`)) {
      return;
    }

    const failed = [];
    for (const id of entryIds) {
      const { error } = await deleteEntryDB(id);
      if (error) {
        failed.push({ id, error });
      }
    }

    if (failed.length > 0) {
      alert(`Nem sikerült ${failed.length} bejegyzést törölni. Kérlek próbáld meg újra.`);
    }
  };

  const handleAddProfile = async (profileData) => {
    setAddingProfile(true);
    try {
      const newProfile = await addProfile(profileData);
      // Auto-select the new profile
      selectProfile(newProfile);
      return { error: null };
    } catch (error) {
      return { error: error.message || 'Nem sikerült hozzáadni' };
    } finally {
      setAddingProfile(false);
    }
  };

  // Show loading while profiles are being loaded
  if (profilesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-theme-50 to-theme-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-slate-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-theme-50 to-theme-50 text-slate-800 flex flex-col">
      <OfflineBanner />
      <Header
        isChild={false}
        session={session}
        onOpenSettings={() => setShowSettings(true)}
        profileSwitcher={
          <ProfileSwitcher
            profiles={profiles}
            activeProfile={activeProfile}
            onSelect={selectProfile}
            onAddProfile={() => setShowAddProfile(true)}
          />
        }
      />

      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-28">
        {tab === 0 && (
          <HomeTab
            symptoms={symptoms}
            onLog={openLogModal}
            entries={entries}
            onEdit={openEditModal}
            onDelete={handleDeleteEntry}
            isParentMode={true}
            onNavigateToSymptoms={() => setTab(1)}
          />
        )}
        {tab === 1 && (
          <AddSymptomTab
            onAdd={async (symptomData) => {
              const { error } = await addSymptom(symptomData);
              if (error) {
                alert(`Hiba a tünet hozzáadásánál: ${error}`);
              }
            }}
            symptoms={symptoms}
            onDelete={deleteSymptom}
            onUpdate={updateSymptom}
          />
        )}
        {tab === 2 && (
          <ManageEntriesTab
            entries={entries}
            symptoms={symptoms}
            onDelete={handleDeleteEntry}
            onEdit={openEditModal}
            onBulkDelete={handleBulkDeleteEntries}
          />
        )}
        {tab === 3 && <PatternsTab entries={entries} symptoms={symptoms} />}
        {tab === 4 && <ExportTab entries={entries} symptoms={symptoms} />}

        <FeedbackBanner variant="parent" />
      </main>

      <ParentBottomNav tab={tab} setTab={setTab} />

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
          foodNote={foodNote}
          setFoodNote={setFoodNote}
          medicationNote={medicationNote}
          setMedicationNote={setMedicationNote}
          photos={photos}
          setPhotos={setPhotos}
          voiceNote={voiceNote}
          setVoiceNote={setVoiceNote}
          entryDate={entryDate}
          setEntryDate={setEntryDate}
          entryTime={entryTime}
          setEntryTime={setEntryTime}
          userId={userId}
          isParentMode={true}
          isEditing={!!editingEntry}
          onClose={closeLogModal}
          onSave={handleSaveEntry}
          isSaving={isSaving}
        />
      )}

      <AddProfileModal
        isOpen={showAddProfile}
        onClose={() => setShowAddProfile(false)}
        onAdd={handleAddProfile}
        isLoading={addingProfile}
      />

      <ParentSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        spreadsheetId={spreadsheetId}
        activeProfile={activeProfile}
        profiles={profiles}
      />
    </div>
  );
}
