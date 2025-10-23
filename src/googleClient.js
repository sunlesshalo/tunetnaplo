import { gapi } from 'gapi-script';

// Google API configuration from environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!CLIENT_ID || !API_KEY) {
  throw new Error(
    'Missing Google API environment variables. Please check your .env file.'
  );
}

// Discovery docs for Google Sheets and Drive APIs
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];

// Authorization scopes required
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
].join(' ');

let gapiInitialized = false;
let authInstance = null;

/**
 * Initialize the Google API client
 */
export async function initGoogleClient() {
  if (gapiInitialized) return;

  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });

        authInstance = gapi.auth2.getAuthInstance();
        gapiInitialized = true;
        console.log('✅ Google API client initialized');
        resolve();
      } catch (error) {
        console.error('❌ Error initializing Google API client:', error);
        reject(error);
      }
    });
  });
}

/**
 * Sign in to Google
 */
export async function signIn() {
  try {
    if (!authInstance) {
      await initGoogleClient();
    }
    const user = await authInstance.signIn();
    return { user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error.message };
  }
}

/**
 * Sign out from Google
 */
export async function signOut() {
  try {
    if (!authInstance) return;
    await authInstance.signOut();
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  if (!authInstance) return null;
  const user = authInstance.currentUser.get();
  return user.isSignedIn() ? user : null;
}

/**
 * Check if user is signed in
 */
export function isSignedIn() {
  if (!authInstance) return false;
  return authInstance.isSignedIn.get();
}

/**
 * Listen for sign-in state changes
 */
export function onAuthStateChanged(callback) {
  if (!authInstance) {
    console.warn('Auth instance not initialized');
    return () => {};
  }

  const listener = authInstance.isSignedIn.listen((isSignedIn) => {
    const user = isSignedIn ? authInstance.currentUser.get() : null;
    callback(user);
  });

  return listener;
}

/**
 * Get user's email
 */
export function getUserEmail() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.getBasicProfile().getEmail();
}

/**
 * Get user's ID
 */
export function getUserId() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.getBasicProfile().getId();
}

/**
 * Get user's name
 */
export function getUserName() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.getBasicProfile().getName();
}

export { gapi };
