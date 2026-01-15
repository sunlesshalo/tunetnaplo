# Session Log

## 2026-01-15 (Session 3)
**Accomplished:**
- Implemented multi-parent and multi-child support
- Created Profiles sheet structure (id, name, theme, avatar_emoji, created_at, updated_at)
- Added profile_id column to Symptoms and Entries sheets
- Created migration function `ensureMultiProfileSupport()` for existing users
- Updated OAuth scope from `drive.file` to `drive` for sharing
- Created new components:
  - ProfileContext.jsx - Profile state management
  - ProfilePickerModal.jsx - Child profile selection on login
  - ProfileSwitcher.jsx - Parent header dropdown
  - AddProfileModal.jsx - Add new child profile
  - ShareSettingsSection.jsx - Share with another parent
  - ParentSettingsModal.jsx - Parent settings with sharing tab
- Updated useGoogleData.js to filter by activeProfile
- Added sharing functions to googleDriveService.js
- Updated Header.jsx to support profileSwitcher prop
- Integrated profiles into ChildView and ParentView

**Build:** Successful

**Next:** Test with real users, verify sharing flow works

---

## 2026-01-15 (Session 2)
**Accomplished:**
- Fixed settings to only save theme on "Mentés" button (not every color click)
- Added date/time editing for log entries (retroactive logging)
- Fixed critical bug: entry update/delete was using sorted index instead of raw row position
- Added chronological re-sorting after add/update entries
- Added offline detection banner with Hungarian message
- Added Hungarian error message translations (`translateError()`)
- Added in-app feedback form via Formspree
- Added PWA support: manifest.json, icons (192/512), service worker, Apple touch icon
- Separated parent/child settings access (parents get ✉️ feedback only, children get ⚙️ settings)

**Deployed:** All changes pushed to main, auto-deployed via Vercel

**Next:** Share with beta testers, gather feedback

---

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

- [decision] Multi-child: Profiles sheet with profile_id foreign key in Symptoms/Entries
- [decision] Multi-parent: Google Drive sharing API (requires `drive` scope instead of `drive.file`)
- [decision] Auto-migration for existing users via `ensureMultiProfileSupport()` in googleSheetsService.js
- [discovery] Parent B joins by finding shared spreadsheets and storing selection in localStorage
- [error] Entry update/delete modifying wrong rows → `fetchEntries` sorted by timestamp, but row index used sorted position. Fixed with `fetchEntriesRaw()` for internal operations
- [error] Entries not chronologically ordered after edit → Added re-sort after add/update in useGoogleData.js
- [decision] Error messages translated to Hungarian via `translateError()` in utils/errorMessages.js
- [decision] Offline detection via `useOnlineStatus` hook + amber banner
- [decision] Feedback via Formspree (VITE_FORMSPREE_ID) - email not exposed in frontend
- [decision] PWA: manifest.json + icons + service worker for installable app experience
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
