// Google API configuration from environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!CLIENT_ID || !API_KEY) {
  throw new Error(
    'Missing Google API environment variables. Please check your .env file.'
  );
}

// Authorization scopes required
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

// Storage keys
const TOKEN_KEY = 'tunetnaplo_access_token';
const TOKEN_EXPIRY_KEY = 'tunetnaplo_token_expiry';

let tokenClient = null;
let accessToken = null;
let gapiInitialized = false;
let tokenRefreshTimeout = null;

/**
 * Store token in localStorage with expiry
 */
function storeToken(token, expiresIn) {
  accessToken = token;
  const expiryTime = Date.now() + (expiresIn * 1000);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

  // Schedule token refresh 5 minutes before expiry
  scheduleTokenRefresh(expiresIn);
}

/**
 * Get stored token if still valid
 */
function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) return null;

  // Check if token is expired (with 5 minute buffer)
  const expiryTime = parseInt(expiry, 10);
  if (Date.now() > expiryTime - 300000) {
    // Token expired or about to expire
    clearStoredToken();
    return null;
  }

  return token;
}

/**
 * Clear stored token
 */
function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  accessToken = null;
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
    tokenRefreshTimeout = null;
  }
}

/**
 * Schedule silent token refresh before expiry
 */
function scheduleTokenRefresh(expiresIn) {
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
  }

  // Refresh 5 minutes before expiry
  const refreshIn = (expiresIn - 300) * 1000;
  if (refreshIn > 0) {
    tokenRefreshTimeout = setTimeout(() => {
      console.log('🔄 Token refresh scheduled...');
      silentTokenRefresh();
    }, refreshIn);
  }
}

/**
 * Silently refresh token without user interaction
 */
async function silentTokenRefresh() {
  return new Promise((resolve) => {
    if (!tokenClient) {
      resolve(false);
      return;
    }

    tokenClient.callback = async (response) => {
      if (response.error) {
        console.log('Silent refresh failed, user needs to re-authenticate');
        clearStoredToken();
        resolve(false);
        return;
      }

      storeToken(response.access_token, response.expires_in);
      window.gapi.client.setToken({ access_token: response.access_token });
      console.log('✅ Token silently refreshed');
      resolve(true);
    };

    // Request token silently (no prompt)
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

/**
 * Initialize the Google API client (gapi)
 */
export async function initGoogleClient() {
  if (gapiInitialized) return;

  return new Promise((resolve, reject) => {
    // Load the gapi library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = async () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [
              'https://sheets.googleapis.com/$discovery/rest?version=v4',
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            ],
          });

          gapiInitialized = true;
          console.log('✅ Google API client initialized');

          // Initialize Google Identity Services (GIS) token client
          await initTokenClient();

          // Try to restore session from stored token
          const storedToken = getStoredToken();
          if (storedToken) {
            accessToken = storedToken;
            window.gapi.client.setToken({ access_token: storedToken });
            console.log('✅ Session restored from stored token');

            // Calculate remaining time and schedule refresh
            const expiry = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY), 10);
            const remainingSeconds = Math.floor((expiry - Date.now()) / 1000);
            scheduleTokenRefresh(remainingSeconds);
          }

          resolve();
        } catch (error) {
          console.error('❌ Error initializing Google API client:', error);
          reject(error);
        }
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Identity Services (GIS) token client
 */
function initTokenClient() {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.google?.accounts?.oauth2) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Set dynamically during sign-in
      });
      console.log('✅ Token client initialized');
      resolve();
      return;
    }

    // Load the GIS library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Set dynamically during sign-in
      });
      console.log('✅ Token client initialized');
      resolve();
    };
    document.head.appendChild(script);
  });
}

/**
 * Sign in to Google
 */
export async function signIn() {
  return new Promise((resolve, reject) => {
    try {
      if (!tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      // Set the callback for this sign-in request
      tokenClient.callback = async (response) => {
        if (response.error) {
          console.error('Sign in error:', response);
          reject(response);
          return;
        }

        // Store token with expiry
        storeToken(response.access_token, response.expires_in);

        // Set the access token for gapi client
        window.gapi.client.setToken({ access_token: accessToken });

        console.log('✅ Sign in successful');
        const userInfo = await getUserInfo();
        await storeUserInfo(userInfo);
        resolve({ user: userInfo, error: null });
      };

      // Request access token - select_account forces account picker
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (error) {
      console.error('Sign in error:', error);
      reject({ user: null, error: error.message });
    }
  });
}

/**
 * Get user info from Google
 */
async function getUserInfo() {
  if (!accessToken) return null;

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = await response.json();
    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

/**
 * Sign out from Google
 */
export async function signOut() {
  try {
    if (accessToken) {
      // Revoke the token
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log('✅ Token revoked');
      });

      clearStoredToken();
      window.gapi.client.setToken(null);
    }
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
  if (!accessToken) return null;

  // Return a simplified user object
  return {
    getBasicProfile: () => ({
      getId: () => localStorage.getItem('user_id'),
      getEmail: () => localStorage.getItem('user_email'),
      getName: () => localStorage.getItem('user_name'),
    }),
  };
}

/**
 * Check if user is signed in
 */
export function isSignedIn() {
  // Check for valid stored token first
  const storedToken = getStoredToken();
  if (storedToken) {
    accessToken = storedToken;
    return true;
  }
  return accessToken !== null && window.gapi?.client?.getToken() !== null;
}

/**
 * Listen for sign-in state changes
 */
export function onAuthStateChanged(callback) {
  // For GIS, we'll use a simple polling mechanism
  let lastSignInState = isSignedIn();

  const interval = setInterval(() => {
    const currentSignInState = isSignedIn();
    if (currentSignInState !== lastSignInState) {
      lastSignInState = currentSignInState;
      callback(currentSignInState ? getCurrentUser() : null);
    }
  }, 1000);

  return () => clearInterval(interval);
}

/**
 * Get user's email
 */
export function getUserEmail() {
  return localStorage.getItem('user_email');
}

/**
 * Get user's ID
 */
export function getUserId() {
  return localStorage.getItem('user_id');
}

/**
 * Get user's name
 */
export function getUserName() {
  return localStorage.getItem('user_name');
}

// Store user info in localStorage when signing in
export async function storeUserInfo(userInfo) {
  localStorage.setItem('user_id', userInfo.id);
  localStorage.setItem('user_email', userInfo.email);
  localStorage.setItem('user_name', userInfo.name);
}

export const gapi = typeof window !== 'undefined' ? window.gapi : null;
