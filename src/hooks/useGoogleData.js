import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUserId } from '../googleClient';
import {
  getSpreadsheetId,
  fetchSymptoms as fetchSymptomsFromSheet,
  addSymptom as addSymptomToSheet,
  updateSymptom as updateSymptomInSheet,
  deleteSymptom as deleteSymptomFromSheet,
  fetchEntries as fetchEntriesFromSheet,
  addEntry as addEntryToSheet,
  updateEntry as updateEntryInSheet,
  deleteEntry as deleteEntryFromSheet,
} from '../services/googleSheetsService';
import { translateError } from '../utils/errorMessages';

// Custom hook for managing symptoms
// profileId: optional - if provided, filters symptoms by profile
export function useSymptoms(userId, profileId = null) {
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);

  // Filter symptoms by profile
  const symptoms = useMemo(() => {
    if (!profileId) return allSymptoms;
    return allSymptoms.filter((s) => s.profile_id === profileId);
  }, [allSymptoms, profileId]);

  // Initialize spreadsheet and load symptoms
  const loadSymptoms = useCallback(async () => {
    if (!userId) return;

    try {
      const sheetId = await getSpreadsheetId(userId);
      setSpreadsheetId(sheetId);

      const data = await fetchSymptomsFromSheet(sheetId);
      setAllSymptoms(data || []);
    } catch (err) {
      console.error('Error loading symptoms:', err);
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSymptoms();

    // Set up periodic refresh (since Google Sheets doesn't have realtime)
    const interval = setInterval(() => {
      if (spreadsheetId) {
        fetchSymptomsFromSheet(spreadsheetId)
          .then((data) => {
            setAllSymptoms(data || []);
          })
          .catch((err) => {
            console.error('Error refreshing symptoms:', err);
            // Don't update state on error - keep existing data
          });
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, loadSymptoms, spreadsheetId]);

  // Add symptom (automatically includes profile_id if provided)
  const addSymptom = async (symptomData) => {
    try {
      console.log('🔵 Adding symptom:', symptomData);

      // Include profile_id if we're filtering by profile
      const dataWithProfile = profileId ? { ...symptomData, profile_id: profileId } : symptomData;

      const data = await addSymptomToSheet(spreadsheetId, dataWithProfile);
      console.log('✅ Symptom added successfully:', data);

      // Update local state
      setAllSymptoms((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err) {
      console.error('❌ Error adding symptom:', err);
      return { data: null, error: translateError(err) };
    }
  };

  // Update symptom
  const updateSymptom = async (symptomId, updates) => {
    try {
      const data = await updateSymptomInSheet(spreadsheetId, symptomId, updates);

      // Update local state
      setAllSymptoms((prev) => prev.map((s) => (s.id === symptomId ? data : s)));

      return { data, error: null };
    } catch (err) {
      console.error('Error updating symptom:', err);
      return { data: null, error: translateError(err) };
    }
  };

  // Delete symptom
  const deleteSymptom = async (symptomId) => {
    try {
      await deleteSymptomFromSheet(spreadsheetId, symptomId);

      // Update local state
      setAllSymptoms((prev) => prev.filter((s) => s.id !== symptomId));

      return { error: null };
    } catch (err) {
      console.error('Error deleting symptom:', err);
      return { error: translateError(err) };
    }
  };

  return {
    symptoms,
    allSymptoms, // Expose all symptoms for cross-profile operations
    loading,
    error,
    addSymptom,
    updateSymptom,
    deleteSymptom,
    refreshSymptoms: loadSymptoms,
  };
}

// Custom hook for managing entries
// profileId: optional - if provided, filters entries by profile
export function useEntries(userId, profileId = null) {
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);

  // Filter entries by profile
  const entries = useMemo(() => {
    if (!profileId) return allEntries;
    return allEntries.filter((e) => e.profile_id === profileId);
  }, [allEntries, profileId]);

  // Initialize spreadsheet and load entries
  const loadEntries = useCallback(async () => {
    if (!userId) return;

    try {
      const sheetId = await getSpreadsheetId(userId);
      setSpreadsheetId(sheetId);

      const data = await fetchEntriesFromSheet(sheetId);
      setAllEntries(data || []);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEntries();

    // Set up periodic refresh (since Google Sheets doesn't have realtime)
    const interval = setInterval(() => {
      if (spreadsheetId) {
        fetchEntriesFromSheet(spreadsheetId)
          .then((data) => {
            setAllEntries(data || []);
          })
          .catch((err) => {
            console.error('Error refreshing entries:', err);
            // Don't update state on error - keep existing data
          });
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, loadEntries, spreadsheetId]);

  // Add entry (automatically includes profile_id if provided)
  const addEntry = async (entryData) => {
    try {
      // Include profile_id if we're filtering by profile
      const dataWithProfile = profileId ? { ...entryData, profile_id: profileId } : entryData;

      const data = await addEntryToSheet(spreadsheetId, dataWithProfile);

      // Update local state and sort by timestamp (newest first)
      setAllEntries((prev) => {
        const updated = [data, ...prev];
        return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      return { data, error: null };
    } catch (err) {
      console.error('Error adding entry:', err);
      return { data: null, error: translateError(err) };
    }
  };

  // Update entry
  const updateEntry = async (entryId, updates) => {
    try {
      const data = await updateEntryInSheet(spreadsheetId, entryId, updates);

      // Update local state and re-sort by timestamp (newest first)
      setAllEntries((prev) => {
        const updated = prev.map((e) => (e.id === entryId ? data : e));
        return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      return { data, error: null };
    } catch (err) {
      console.error('Error updating entry:', err);
      return { data: null, error: translateError(err) };
    }
  };

  // Delete entry
  const deleteEntry = async (entryId) => {
    try {
      console.log('🔴 Deleting entry:', { entryId, userId });

      // Optimistically remove from UI immediately
      setAllEntries((prev) => prev.filter((e) => e.id !== entryId));

      await deleteEntryFromSheet(spreadsheetId, entryId);

      console.log('✅ Entry deleted successfully');
      return { error: null };
    } catch (err) {
      console.error('❌ Error deleting entry:', err);

      // If delete failed, refetch to restore the entry
      const data = await fetchEntriesFromSheet(spreadsheetId);
      setAllEntries(data || []);

      return { error: translateError(err) };
    }
  };

  return {
    entries,
    allEntries, // Expose all entries for cross-profile operations (e.g., patterns)
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries: loadEntries,
  };
}
