import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tunetnaplo_settings';

const DEFAULT_SETTINGS = {
  theme: 'sky',
  userName: '',
  parentPin: '', // Empty = no PIN required
  biometricEnabled: false, // Biometric auth for parent mode
};

const THEMES = [
  { id: 'sky', label: 'Kék', color: '#38bdf8' },
  { id: 'emerald', label: 'Zöld', color: '#34d399' },
  { id: 'violet', label: 'Lila', color: '#a78bfa' },
  { id: 'rose', label: 'Rózsaszín', color: '#fb7185' },
  { id: 'amber', label: 'Sárga', color: '#fbbf24' },
];

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [settings]);

  const setTheme = useCallback((theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setUserName = useCallback((userName) => {
    setSettings((prev) => ({ ...prev, userName }));
  }, []);

  const setParentPin = useCallback((parentPin) => {
    setSettings((prev) => ({ ...prev, parentPin }));
  }, []);

  const setBiometricEnabled = useCallback((biometricEnabled) => {
    setSettings((prev) => ({ ...prev, biometricEnabled }));
  }, []);

  return {
    theme: settings.theme,
    userName: settings.userName,
    parentPin: settings.parentPin,
    biometricEnabled: settings.biometricEnabled,
    setTheme,
    setUserName,
    setParentPin,
    setBiometricEnabled,
    themes: THEMES,
  };
}

// Helper to get time-based greeting
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Jó reggelt';
  if (hour < 18) return 'Jó napot';
  return 'Jó estét';
}
