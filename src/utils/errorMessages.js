/**
 * Hungarian error message translations
 * Maps common error patterns to user-friendly Hungarian messages
 */

const ERROR_TRANSLATIONS = {
  // Network errors
  'Failed to fetch': 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.',
  'Network error': 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.',
  'NetworkError': 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.',
  'net::ERR_': 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.',
  'Load failed': 'Nem sikerült betölteni. Ellenőrizd az internetkapcsolatot.',

  // Google API errors
  'Google API client not initialized': 'Jelentkezz be újra a Google-fiókodba.',
  'Request had insufficient authentication': 'A munkamenet lejárt. Jelentkezz be újra.',
  'Invalid Credentials': 'Érvénytelen bejelentkezés. Jelentkezz be újra.',
  'Access denied': 'Nincs jogosultság. Jelentkezz be újra.',
  'Permission denied': 'Nincs jogosultság a művelethez.',
  'Forbidden': 'Nincs jogosultság a művelethez.',
  'Unauthorized': 'Jelentkezz be újra.',

  // Not found errors
  'Entry not found': 'A bejegyzés nem található.',
  'Symptom not found': 'A tünet nem található.',
  'Spreadsheet not found': 'Az adatlap nem található.',
  'File not found': 'A fájl nem található.',
  'not found': 'Az elem nem található.',
  '404': 'Az elem nem található.',

  // Quota/rate limit errors
  'Rate Limit Exceeded': 'Túl sok kérés. Várj egy kicsit és próbáld újra.',
  'Quota exceeded': 'Túl sok kérés. Várj egy kicsit és próbáld újra.',
  'Too Many Requests': 'Túl sok kérés. Várj egy kicsit és próbáld újra.',
  '429': 'Túl sok kérés. Várj egy kicsit és próbáld újra.',

  // Server errors
  '500': 'Szerverhiba. Próbáld újra később.',
  '502': 'Szerverhiba. Próbáld újra később.',
  '503': 'A szolgáltatás átmenetileg nem elérhető. Próbáld újra később.',
  'Internal Server Error': 'Szerverhiba. Próbáld újra később.',

  // Upload errors
  'upload failed': 'Nem sikerült feltölteni a fájlt.',
  'File too large': 'A fájl túl nagy.',

  // Timeout
  'timeout': 'A művelet túl sokáig tartott. Próbáld újra.',
  'Timeout': 'A művelet túl sokáig tartott. Próbáld újra.',
};

/**
 * Translates an error message to Hungarian
 * Falls back to a generic message if no translation found
 *
 * @param {string|Error} error - The error message or Error object
 * @param {string} fallback - Optional custom fallback message
 * @returns {string} Hungarian error message
 */
export function translateError(error, fallback = 'Hiba történt. Próbáld újra.') {
  const message = error instanceof Error ? error.message : String(error || '');

  // Check each pattern
  for (const [pattern, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return translation;
    }
  }

  // Check for HTTP status codes in error
  const statusMatch = message.match(/\b(4\d{2}|5\d{2})\b/);
  if (statusMatch) {
    const status = statusMatch[1];
    if (ERROR_TRANSLATIONS[status]) {
      return ERROR_TRANSLATIONS[status];
    }
  }

  return fallback;
}

/**
 * Wraps an async function to translate its errors
 *
 * @param {Function} fn - Async function to wrap
 * @param {string} fallback - Optional custom fallback message
 * @returns {Function} Wrapped function with translated errors
 */
export function withTranslatedErrors(fn, fallback) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const translated = translateError(error, fallback);
      const newError = new Error(translated);
      newError.originalError = error;
      throw newError;
    }
  };
}
