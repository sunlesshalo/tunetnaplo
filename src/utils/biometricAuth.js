// Biometric authentication utilities using WebAuthn API
// Supports Face ID, Touch ID, fingerprint on compatible devices

const CREDENTIAL_STORAGE_KEY = 'tunetnaplo_biometric_credential';

/**
 * Check if biometric authentication is available on this device
 * @returns {Promise<boolean>}
 */
export async function isBiometricAvailable() {
  try {
    if (!window.PublicKeyCredential) {
      return false;
    }

    // Check if platform authenticator (Touch ID, Face ID, fingerprint) is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
}

/**
 * Get a user-friendly name for the biometric method
 * @returns {string}
 */
export function getBiometricName() {
  const ua = navigator.userAgent;

  // iOS devices
  if (/iPad|iPhone|iPod/.test(ua)) {
    // iPhone X and later have Face ID, older have Touch ID
    // We can't reliably detect which, so use generic term
    return 'Face ID / Touch ID';
  }

  // macOS
  if (/Macintosh/.test(ua)) {
    return 'Touch ID';
  }

  // Windows
  if (/Windows/.test(ua)) {
    return 'Windows Hello';
  }

  // Android
  if (/Android/.test(ua)) {
    return 'Ujjlenyomat';
  }

  // Generic fallback
  return 'Biometrikus azonosítás';
}

/**
 * Register biometric credential for parent mode authentication
 * @returns {Promise<{success: boolean, credentialId?: string, error?: string}>}
 */
export async function registerBiometric() {
  try {
    // Generate a random user ID for this registration
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    // Generate challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Tünetnapló',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: 'parent',
          displayName: 'Szülő',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Only platform authenticators (built-in)
          userVerification: 'required',        // Require biometric/PIN
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none', // We don't need attestation for this use case
      },
    });

    if (!credential) {
      return { success: false, error: 'Nem sikerült létrehozni a hitelesítést' };
    }

    // Store credential ID for later authentication
    const credentialId = arrayBufferToBase64(credential.rawId);
    localStorage.setItem(CREDENTIAL_STORAGE_KEY, credentialId);

    console.log('Biometric registered successfully');
    return { success: true, credentialId };
  } catch (error) {
    console.error('Error registering biometric:', error);

    // User-friendly error messages
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'A biometrikus azonosítás meg lett szakítva' };
    }
    if (error.name === 'NotSupportedError') {
      return { success: false, error: 'Ez az eszköz nem támogatja a biometrikus azonosítást' };
    }

    return { success: false, error: error.message || 'Ismeretlen hiba történt' };
  }
}

/**
 * Authenticate using biometric
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function authenticateWithBiometric() {
  try {
    const storedCredentialId = localStorage.getItem(CREDENTIAL_STORAGE_KEY);

    if (!storedCredentialId) {
      return { success: false, error: 'Nincs regisztrált biometrikus azonosító' };
    }

    // Generate challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credentialId = base64ToArrayBuffer(storedCredentialId);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            id: credentialId,
            type: 'public-key',
            transports: ['internal'], // Platform authenticator
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    if (!assertion) {
      return { success: false, error: 'A hitelesítés sikertelen' };
    }

    console.log('Biometric authentication successful');
    return { success: true };
  } catch (error) {
    console.error('Error authenticating with biometric:', error);

    // User-friendly error messages
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'A biometrikus azonosítás meg lett szakítva' };
    }
    if (error.name === 'InvalidStateError') {
      return { success: false, error: 'Érvénytelen azonosító, kérjük regisztrálja újra' };
    }

    return { success: false, error: error.message || 'Ismeretlen hiba történt' };
  }
}

/**
 * Remove stored biometric credential
 */
export function removeBiometricCredential() {
  localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
  console.log('Biometric credential removed');
}

/**
 * Check if a biometric credential is registered
 * @returns {boolean}
 */
export function hasBiometricCredential() {
  return !!localStorage.getItem(CREDENTIAL_STORAGE_KEY);
}

// Helper functions for ArrayBuffer <-> Base64 conversion
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
