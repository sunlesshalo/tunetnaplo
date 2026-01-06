import { useState, useEffect, useCallback, useRef } from 'react';
import { getSpreadsheetId, fetchSharedSettings, saveSharedSetting } from '../services/googleSheetsService';

// Local-only settings (device-specific)
const LOCAL_STORAGE_KEY = 'tunetnaplo_local_settings';

const DEFAULT_LOCAL_SETTINGS = {
  parentPin: '', // PIN is device-specific
  biometricEnabled: false, // Biometric is device-specific
};

// Shared settings defaults (synced via Google Sheets)
const DEFAULT_SHARED_SETTINGS = {
  theme: 'sky',
  userName: '',
};

const THEMES = [
  { id: 'sky', label: 'Kék', color: '#38bdf8' },
  { id: 'emerald', label: 'Zöld', color: '#34d399' },
  { id: 'violet', label: 'Lila', color: '#a78bfa' },
  { id: 'rose', label: 'Rózsaszín', color: '#fb7185' },
  { id: 'amber', label: 'Sárga', color: '#fbbf24' },
];

export function useSettings(userId) {
  // Local settings (device-specific) - loaded from localStorage
  const [localSettings, setLocalSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_LOCAL_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading local settings:', e);
    }
    return DEFAULT_LOCAL_SETTINGS;
  });

  // Shared settings (synced) - loaded from Google Sheets
  const [sharedSettings, setSharedSettings] = useState(DEFAULT_SHARED_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Track spreadsheet ID
  const spreadsheetIdRef = useRef(null);

  // Load shared settings from Google Sheets on mount
  useEffect(() => {
    async function loadSharedSettings() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const spreadsheetId = await getSpreadsheetId(userId);
        spreadsheetIdRef.current = spreadsheetId;

        const settings = await fetchSharedSettings(spreadsheetId);
        setSharedSettings({
          theme: settings.theme || DEFAULT_SHARED_SETTINGS.theme,
          userName: settings.userName || DEFAULT_SHARED_SETTINGS.userName,
        });
      } catch (error) {
        console.error('Error loading shared settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSharedSettings();
  }, [userId]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', sharedSettings.theme);
  }, [sharedSettings.theme]);

  // Persist local settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSettings));
    } catch (e) {
      console.error('Error saving local settings:', e);
    }
  }, [localSettings]);

  // Shared setting setters (save to Google Sheets)
  const setTheme = useCallback(async (theme) => {
    setSharedSettings((prev) => ({ ...prev, theme }));

    // Save to Google Sheets
    if (spreadsheetIdRef.current) {
      try {
        await saveSharedSetting(spreadsheetIdRef.current, 'theme', theme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  }, []);

  const setUserName = useCallback(async (userName) => {
    setSharedSettings((prev) => ({ ...prev, userName }));

    // Save to Google Sheets
    if (spreadsheetIdRef.current) {
      try {
        await saveSharedSetting(spreadsheetIdRef.current, 'userName', userName);
      } catch (error) {
        console.error('Error saving userName:', error);
      }
    }
  }, []);

  // Local setting setters (localStorage only)
  const setParentPin = useCallback((parentPin) => {
    setLocalSettings((prev) => ({ ...prev, parentPin }));
  }, []);

  const setBiometricEnabled = useCallback((biometricEnabled) => {
    setLocalSettings((prev) => ({ ...prev, biometricEnabled }));
  }, []);

  return {
    // Shared settings (synced across devices)
    theme: sharedSettings.theme,
    userName: sharedSettings.userName,
    setTheme,
    setUserName,

    // Local settings (device-specific)
    parentPin: localSettings.parentPin,
    biometricEnabled: localSettings.biometricEnabled,
    setParentPin,
    setBiometricEnabled,

    // Meta
    themes: THEMES,
    isLoading,
  };
}

// Helper to get time-based greeting
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Jó reggelt';
  if (hour < 18) return 'Jó napot';
  return 'Jó estét';
}
