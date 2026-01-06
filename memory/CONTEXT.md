# Session Log

## 2026-01-06 (Session 1)
**Accomplished:**
- Fixed double-logging race condition in useEntryModal.js using useRef
- Added polling error handling to useGoogleData.js
- Implemented dynamic theme colors across all 14 components
- Added parent mode navigation with optional PIN protection
- Fixed Google OAuth account picker (`prompt: 'select_account'`)
- Security audit: removed public file sharing, created AuthenticatedAudio component

**Deployed:** https://tunetnaplo.vercel.app

**Next:** Beta testing with family, gather feedback

---

# Notes

<!--
Tag entries for easy searching:
- [error] Problem → solution
- [discovery] What was learned
- [decision] What was decided and why
-->

## Technical

- [error] Double-logging entries → Fixed with useRef for synchronous check in useEntryModal.js
- [error] Blank page on Vercel → Missing env vars (VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_API_KEY)
- [error] Google OAuth auto-selects work account → Changed `prompt: 'consent'` to `prompt: 'select_account'`
- [discovery] Photos use Google Drive thumbnail API - works for authenticated owner
- [discovery] Voice notes need authenticated fetch → blob URL for playback
- [decision] Theme colors via CSS custom properties - 5 themes (sky, emerald, violet, rose, amber)
- [decision] Parent mode protected by optional PIN stored in localStorage

## Architecture

- [discovery] App uses Google Sheets for data (privacy-first, no external database)
- [discovery] Google Drive for photos/voice notes (user owns their data)
- [discovery] Dual-mode system: Child View (/) and Parent View (/szulo)
- [decision] Migrated from Supabase to Google Sheets/Drive for family ownership of data

## Deployment

- [discovery] Vercel auto-deploys from main branch
- [decision] Production branch changed from `no-login` to `main`
- [discovery] Google Cloud Console: must add Vercel domain to authorized origins

---

# Reference

## Key Files
- `src/hooks/useEntryModal.js` - Entry form state management
- `src/hooks/useGoogleData.js` - Symptoms & entries CRUD with Google Sheets
- `src/index.css` - Theme CSS custom properties
- `src/googleClient.js` - Google OAuth configuration

## Environment Variables
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_GOOGLE_API_KEY` - Google API key (for Sheets/Drive)
- `VITE_OPENWEATHER_API_KEY` - Optional weather API for environment capture
