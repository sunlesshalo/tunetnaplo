import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSpreadsheetId,
  fetchProfiles,
  ensureMultiProfileSupport,
  addProfile as addProfileToSheet,
  updateProfile as updateProfileInSheet,
  deleteProfile as deleteProfileFromSheet,
  getCachedSpreadsheetId,
} from '../services/googleSheetsService';
import {
  findSharedSpreadsheets,
  joinSharedSpreadsheet,
  getJoinedSpreadsheetId,
} from '../services/googleDriveService';
import JoinFamilyModal from '../components/shared/JoinFamilyModal';

const ProfileContext = createContext(null);

export function ProfileProvider({ children, userId }) {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfileState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [error, setError] = useState(null);

  // Join family flow state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sharedSpreadsheets, setSharedSpreadsheets] = useState([]);
  const [joiningFamily, setJoiningFamily] = useState(false);

  // Continue initialization after join decision
  const continueInit = useCallback(async (sheetId) => {
    try {
      // Ensure multi-profile migration has happened
      await ensureMultiProfileSupport(sheetId);

      // Load profiles
      const data = await fetchProfiles(sheetId);
      setProfiles(data);

      // Auto-select logic
      if (data.length === 1) {
        // Single profile - auto-select
        setActiveProfileState(data[0]);
        localStorage.setItem('tunetnaplo_active_profile', data[0].id);
      } else if (data.length > 1) {
        // Multiple profiles - check localStorage for last used
        const lastUsedId = localStorage.getItem('tunetnaplo_active_profile');
        const found = data.find((p) => p.id === lastUsedId);
        if (found) {
          setActiveProfileState(found);
        }
        // If not found, activeProfile remains null -> show picker
      }
      // If no profiles, create default one
      else if (data.length === 0) {
        const defaultProfile = await addProfileToSheet(sheetId, {
          name: 'Gyermek',
          theme: 'sky',
          avatar_emoji: '🧒',
        });
        setProfiles([defaultProfile]);
        setActiveProfileState(defaultProfile);
        localStorage.setItem('tunetnaplo_active_profile', defaultProfile.id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize profiles on mount
  useEffect(() => {
    async function init() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Check if user already has their own spreadsheet or has joined one
        const hasOwnSpreadsheet = getCachedSpreadsheetId(userId);
        const hasJoinedSpreadsheet = getJoinedSpreadsheetId(userId);

        // If user is new (no spreadsheet yet), check for shared spreadsheets
        if (!hasOwnSpreadsheet && !hasJoinedSpreadsheet) {
          console.log('New user - checking for shared spreadsheets...');
          const shared = await findSharedSpreadsheets();

          if (shared.length > 0) {
            console.log('Found shared spreadsheets:', shared);
            setSharedSpreadsheets(shared);
            setShowJoinModal(true);
            // Don't setLoading(false) yet - wait for user decision
            return;
          }
        }

        // Get spreadsheet ID (own or joined)
        const sheetId = await getSpreadsheetId(userId);
        setSpreadsheetId(sheetId);

        await continueInit(sheetId);
      } catch (err) {
        console.error('Error initializing profiles:', err);
        setError(err.message || 'Hiba történt a profilok betöltésekor');
        setLoading(false);
      }
    }

    init();
  }, [userId, continueInit]);

  // Handle joining a shared spreadsheet
  const handleJoinFamily = useCallback(async (sheetIdToJoin) => {
    setJoiningFamily(true);
    try {
      // Store the joined spreadsheet
      joinSharedSpreadsheet(userId, sheetIdToJoin);
      setSpreadsheetId(sheetIdToJoin);
      setShowJoinModal(false);

      await continueInit(sheetIdToJoin);
    } catch (err) {
      console.error('Error joining family:', err);
      setError('Nem sikerült csatlakozni a családhoz');
      setLoading(false);
    } finally {
      setJoiningFamily(false);
    }
  }, [userId, continueInit]);

  // Handle creating own spreadsheet (decline join)
  const handleCreateOwn = useCallback(async () => {
    setShowJoinModal(false);
    try {
      // Get own spreadsheet (will create new)
      const sheetId = await getSpreadsheetId(userId);
      setSpreadsheetId(sheetId);

      await continueInit(sheetId);
    } catch (err) {
      console.error('Error creating own spreadsheet:', err);
      setError('Nem sikerült létrehozni az adatokat');
      setLoading(false);
    }
  }, [userId, continueInit]);

  // Select a profile
  const selectProfile = useCallback((profile) => {
    setActiveProfileState(profile);
    localStorage.setItem('tunetnaplo_active_profile', profile.id);
  }, []);

  // Add a new profile
  const addProfile = useCallback(
    async (profileData) => {
      if (!spreadsheetId) throw new Error('Spreadsheet not initialized');

      const newProfile = await addProfileToSheet(spreadsheetId, profileData);
      setProfiles((prev) => [...prev, newProfile]);
      return newProfile;
    },
    [spreadsheetId]
  );

  // Update a profile
  const updateProfile = useCallback(
    async (profileId, updates) => {
      if (!spreadsheetId) throw new Error('Spreadsheet not initialized');

      const updated = await updateProfileInSheet(spreadsheetId, profileId, updates);
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? updated : p)));

      // Update active profile if it's the one being updated
      if (activeProfile?.id === profileId) {
        setActiveProfileState(updated);
      }

      return updated;
    },
    [spreadsheetId, activeProfile]
  );

  // Delete a profile
  const deleteProfile = useCallback(
    async (profileId, cascadeDelete = false) => {
      if (!spreadsheetId) throw new Error('Spreadsheet not initialized');
      if (profiles.length <= 1) throw new Error('Cannot delete the last profile');

      await deleteProfileFromSheet(spreadsheetId, profileId, cascadeDelete);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));

      // If deleting active profile, switch to first remaining
      if (activeProfile?.id === profileId) {
        const remaining = profiles.filter((p) => p.id !== profileId);
        if (remaining.length > 0) {
          selectProfile(remaining[0]);
        }
      }
    },
    [spreadsheetId, profiles, activeProfile, selectProfile]
  );

  // Refresh profiles from server
  const refreshProfiles = useCallback(async () => {
    if (!spreadsheetId) return;

    try {
      const data = await fetchProfiles(spreadsheetId);
      setProfiles(data);
    } catch (err) {
      console.error('Error refreshing profiles:', err);
    }
  }, [spreadsheetId]);

  const value = {
    // State
    profiles,
    activeProfile,
    loading,
    error,
    spreadsheetId,

    // Computed
    hasMultipleProfiles: profiles.length > 1,
    needsProfileSelection: profiles.length > 1 && !activeProfile,

    // Actions
    selectProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    refreshProfiles,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}

      {/* Join Family Modal - shown when shared spreadsheets are detected */}
      <JoinFamilyModal
        isOpen={showJoinModal}
        sharedSpreadsheets={sharedSpreadsheets}
        onJoin={handleJoinFamily}
        onCreate={handleCreateOwn}
        isLoading={joiningFamily}
      />
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileContext;
