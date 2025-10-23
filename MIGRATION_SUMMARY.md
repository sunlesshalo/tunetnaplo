# Migration Summary: Supabase → Google Sheets + Google OAuth

## Completed Changes

### 1. Dependencies Updated
- ✅ Removed `@supabase/supabase-js`
- ✅ Added `@react-oauth/google` and `gapi-script`

### 2. New Files Created

#### Authentication & API Clients
- **`src/googleClient.js`** - Google OAuth and API client initialization
  - Handles Google Sign-In/Sign-Out
  - Manages authentication state
  - Provides user info helpers

#### Services
- **`src/services/googleSheetsService.js`** - Google Sheets operations
  - Creates/finds user's "Tünetnapló" spreadsheet
  - CRUD operations for symptoms and entries
  - Auto-initializes headers in sheets

- **`src/services/googleDriveService.js`** - Google Drive file operations
  - Uploads photos to `Tünetnapló/photos` folder
  - Uploads voice notes to `Tünetnapló/voice` folder
  - Manages file permissions and URLs
  - Delete operations

#### Hooks
- **`src/hooks/useGoogleData.js`** - Replaces `useSupabaseData.js`
  - `useSymptoms()` - Manages symptoms with periodic polling
  - `useEntries()` - Manages entries with periodic polling
  - 30-second auto-refresh interval (since no realtime)

### 3. Updated Files

#### Core Components
- **`src/App.jsx`** - Google auth initialization and session management
- **`src/Auth.jsx`** - Google Sign-In button with OAuth flow
- **`src/components/layout/Header.jsx`** - Google sign-out functionality

#### Data Layers
- **`src/utils/storageHelpers.js`** - Updated to use Google Drive
- **`src/components/views/ChildView.jsx`** - Uses `useGoogleData`
- **`src/components/views/ParentView.jsx`** - Uses `useGoogleData`

#### Configuration
- **`.env.example`** - New Google API environment variables
- **`README.md`** - Complete Google Cloud setup instructions
- **`package.json`** - Updated dependencies

### 4. Deleted Files
- ❌ `src/supabaseClient.js`
- ❌ `supabase_schema.sql`
- ❌ `supabase_profile_trigger.sql`
- ❌ `supabase_storage_setup.sql`
- ❌ `enable_realtime.sql`
- ❌ `fix_photos_column.sql`
- ❌ `fix_profiles.sql`
- ❌ `SUPABASE_SETUP.md`
- ❌ `README_SUPABASE.md`

## Key Architectural Changes

### Authentication
- **Before**: Supabase Auth (email/password)
- **After**: Google OAuth 2.0 (Google Sign-In)

### Data Storage
- **Before**: PostgreSQL database in Supabase
- **After**: Google Sheets in user's own Drive
  - Spreadsheet: "Tünetnapló"
  - Sheets: "Symptoms" and "Entries"
  - Auto-created on first use

### File Storage
- **Before**: Supabase Storage buckets
- **After**: Google Drive folders
  - `Tünetnapló/photos/`
  - `Tünetnapló/voice/`

### Real-time Updates
- **Before**: Supabase Realtime subscriptions
- **After**: Periodic polling (30 seconds)
  - Manual refresh option available

### Data Ownership
- **Before**: Data in your Supabase project
- **After**: Each user owns their data in their Google Drive

## Next Steps

### 1. Install Dependencies
```bash
cd /Users/ferenczcsuszner/Coding/Tunetnaplo
npm install
```

### 2. Set Up Google Cloud Project
Follow the README instructions to:
1. Create Google Cloud project
2. Enable Google Sheets API and Drive API
3. Create OAuth 2.0 credentials
4. Create API key
5. Configure OAuth redirect URIs

### 3. Configure Environment Variables
Create `.env.local` and add:
```env
VITE_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
VITE_GOOGLE_API_KEY="your-api-key"
VITE_OPENWEATHER_API_KEY="your-weather-key" # Optional
VITE_FEEDBACK_EMAIL="your-email@example.com" # Optional
```

### 4. Test Locally
```bash
npm run dev
```

Test the following:
- [ ] Google Sign-In flow
- [ ] Automatic spreadsheet creation
- [ ] Adding symptoms
- [ ] Logging entries
- [ ] Uploading photos
- [ ] Recording voice notes
- [ ] Viewing data in Google Sheets
- [ ] Editing entries
- [ ] Deleting entries
- [ ] Sign out

### 5. Deploy to Vercel
1. Update OAuth redirect URIs in Google Cloud Console
2. Set environment variables in Vercel dashboard
3. Deploy!

## Important Notes

### Differences from Supabase
1. **No realtime updates** - Data refreshes every 30 seconds or on manual refresh
2. **Google Drive quota** - Users have 15 GB free (vs unlimited in your Supabase project)
3. **First-time setup** - Spreadsheet creation takes 1-2 seconds on first login
4. **Public file access** - Files are made publicly accessible via link (necessary for display)

### API Quota Limits
- Google Sheets API: 300 requests per minute per project
- Google Drive API: 1000 requests per 100 seconds per user
- These limits should be sufficient for normal use

### Security Considerations
- OAuth scopes are limited to Sheets and Drive
- Each user only accesses their own data
- API keys should be restricted to your domains
- Consider implementing rate limiting in production

## Troubleshooting

### Common Issues
1. **"Missing Google API environment variables"**
   - Make sure `.env.local` exists with correct values

2. **OAuth redirect URI mismatch**
   - Ensure Google Cloud Console URIs match your domain exactly

3. **Spreadsheet not found**
   - Clear localStorage and reload to force recreation

4. **Files not uploading**
   - Check browser console for CORS or permission errors
   - Verify Drive API is enabled

5. **Data not refreshing**
   - Wait 30 seconds for auto-refresh or manually reload page
   - Check browser console for API errors

## Migration Complete! 🎉

The app is now fully migrated to Google Sheets and Drive. Each user will store their data in their own Google account, providing better privacy and data ownership.
