import { useState, useEffect, useCallback } from 'react';
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

// Custom hook for managing symptoms
export function useSymptoms(userId) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);

  // Initialize spreadsheet and load symptoms
  const loadSymptoms = useCallback(async () => {
    if (!userId) return;

    try {
      const sheetId = await getSpreadsheetId(userId);
      setSpreadsheetId(sheetId);

      const data = await fetchSymptomsFromSheet(sheetId);
      setSymptoms(data || []);
    } catch (err) {
      console.error('Error loading symptoms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSymptoms();

    // Set up periodic refresh (since Google Sheets doesn't have realtime)
    const interval = setInterval(() => {
      if (spreadsheetId) {
        fetchSymptomsFromSheet(spreadsheetId).then((data) => {
          setSymptoms(data || []);
        });
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, loadSymptoms, spreadsheetId]);

  // Add symptom
  const addSymptom = async (symptomData) => {
    try {
      console.log('🔵 Adding symptom:', symptomData);
      const data = await addSymptomToSheet(spreadsheetId, symptomData);
      console.log('✅ Symptom added successfully:', data);

      // Update local state
      setSymptoms((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err) {
      console.error('❌ Error adding symptom:', err);
      return { data: null, error: err.message };
    }
  };

  // Update symptom
  const updateSymptom = async (symptomId, updates) => {
    try {
      const data = await updateSymptomInSheet(spreadsheetId, symptomId, updates);

      // Update local state
      setSymptoms((prev) => prev.map((s) => (s.id === symptomId ? data : s)));

      return { data, error: null };
    } catch (err) {
      console.error('Error updating symptom:', err);
      return { data: null, error: err.message };
    }
  };

  // Delete symptom
  const deleteSymptom = async (symptomId) => {
    try {
      await deleteSymptomFromSheet(spreadsheetId, symptomId);

      // Update local state
      setSymptoms((prev) => prev.filter((s) => s.id !== symptomId));

      return { error: null };
    } catch (err) {
      console.error('Error deleting symptom:', err);
      return { error: err.message };
    }
  };

  return {
    symptoms,
    loading,
    error,
    addSymptom,
    updateSymptom,
    deleteSymptom,
    refreshSymptoms: loadSymptoms,
  };
}

// Custom hook for managing entries
export function useEntries(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);

  // Initialize spreadsheet and load entries
  const loadEntries = useCallback(async () => {
    if (!userId) return;

    try {
      const sheetId = await getSpreadsheetId(userId);
      setSpreadsheetId(sheetId);

      const data = await fetchEntriesFromSheet(sheetId);
      setEntries(data || []);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEntries();

    // Set up periodic refresh (since Google Sheets doesn't have realtime)
    const interval = setInterval(() => {
      if (spreadsheetId) {
        fetchEntriesFromSheet(spreadsheetId).then((data) => {
          setEntries(data || []);
        });
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userId, loadEntries, spreadsheetId]);

  // Add entry
  const addEntry = async (entryData) => {
    try {
      const data = await addEntryToSheet(spreadsheetId, entryData);

      // Update local state
      setEntries((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err) {
      console.error('Error adding entry:', err);
      return { data: null, error: err.message };
    }
  };

  // Update entry
  const updateEntry = async (entryId, updates) => {
    try {
      const data = await updateEntryInSheet(spreadsheetId, entryId, updates);

      // Update local state
      setEntries((prev) => prev.map((e) => (e.id === entryId ? data : e)));

      return { data, error: null };
    } catch (err) {
      console.error('Error updating entry:', err);
      return { data: null, error: err.message };
    }
  };

  // Delete entry
  const deleteEntry = async (entryId) => {
    try {
      console.log('🔴 Deleting entry:', { entryId, userId });

      // Optimistically remove from UI immediately
      setEntries((prev) => prev.filter((e) => e.id !== entryId));

      await deleteEntryFromSheet(spreadsheetId, entryId);

      console.log('✅ Entry deleted successfully');
      return { error: null };
    } catch (err) {
      console.error('❌ Error deleting entry:', err);

      // If delete failed, refetch to restore the entry
      const data = await fetchEntriesFromSheet(spreadsheetId);
      setEntries(data || []);

      return { error: err.message };
    }
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries: loadEntries,
  };
}
