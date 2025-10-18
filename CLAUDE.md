# Claude Code - Tünetnapló Project Guide

## Project Overview

**Tünetnapló** is a symptom tracking app for children with medical conditions, designed for a 7-year-old and their parents.

- **Tech Stack**: React 19, Vite, Tailwind CSS, Supabase (PostgreSQL + Auth + Storage)
- **Branch**: `no-login` - Uses auto-login for family ease of use
- **Deployment**: Vercel

---

## Architecture

### Dual-Mode System

The app has two distinct user experiences:

1. **Child View** (`/`) - Simplified, emoji-heavy, quick logging
2. **Parent View** (`/szulo`) - Full features, analytics, management

### Key Design Patterns

- **Component Organization**: Features grouped by concern (entries, symptoms, stats, etc.)
- **Hooks**: Data fetching (`useSupabaseData`), form state (`useEntryModal`)
- **Modals**: Infrequent actions (symptom management, export) use modal overlays
- **3-Tab Parent Navigation**: Főoldal (Home) → Napló (Diary) → Elemzés (Analytics)

---

## File Structure

```
src/
├── App.jsx                      # Auth + routing only (76 lines)
├── components/
│   ├── layout/                  # Header, BottomNav, ParentBottomNav
│   ├── shared/                  # SectionTitle, HintCard, QuickActionsCard, Modal, etc.
│   ├── entries/                 # EntryCard, EntriesSection, LogModal
│   ├── symptoms/                # AddSymptomTab
│   ├── stats/                   # PatternsTab
│   └── views/
│       ├── ChildView.jsx
│       ├── ParentView.jsx
│       ├── HomeTab.jsx
│       └── parent-tabs/         # DiaryTab, AnalyticsTab, ExportTab, ManageEntriesTab
├── hooks/
│   ├── useSupabaseData.js       # Symptoms & entries CRUD
│   └── useEntryModal.js         # Entry form state management
├── utils/
│   ├── helpers.js               # captureEnvironment, confirmDeleteEntry
│   ├── constants.js             # EMOJI_SET, todayISO
│   ├── patternAnalysis.js       # Pattern detection algorithms
│   ├── pdfExport.js             # PDF generation
│   └── storageHelpers.js        # Photo/voice upload to Supabase Storage
├── supabaseClient.js
├── Auth.jsx
├── PhotoUpload.jsx
└── VoiceRecorder.jsx
```

---

## Database Schema

### Tables

**profiles**
- `id` (UUID, FK to auth.users)
- `email`, `created_at`, `updated_at`

**symptoms**
- `id`, `user_id`, `name`, `emoji`, `parent_only` (boolean)
- Parent-only symptoms hidden from child view

**entries** (symptom logs)
- `id`, `user_id`, `symptom_id`, `date`, `timestamp`
- `intensity` (0-10), `duration` (minutes), `note`
- `context` (JSONB): mood, energy, activity, food, medication
- `environment` (JSONB): weather, temp, pressure, location, timeOfDay, dayOfWeek
- `photos` (array), `voice_note` (path)

### Storage Buckets

- `symptom-photos` - Photo attachments
- `voice-notes` - Voice recordings

---

## Common Tasks

### Adding a New Component

1. Place in appropriate directory (`components/[category]/`)
2. Import where needed (prefer named exports for clarity)
3. Keep components small (<300 lines ideally)

### Modifying Parent Navigation

- **ParentBottomNav.jsx** - Tab bar labels and icons
- **ParentView.jsx** - Tab content routing (currently 3 tabs: 0, 1, 2)

### Adding a New Tab

1. Create in `components/views/parent-tabs/`
2. Import in `ParentView.jsx`
3. Add to tab switch statement
4. Update `ParentBottomNav` if adding a new tab

### Data Flow

```
Supabase → useSymptoms/useEntries hooks → View components → UI
                                        ↓
                                   useEntryModal (form state)
                                        ↓
                                   LogModal (UI)
```

---

## Development Workflow

### Setup

```bash
npm install
```

### Auto-Login Configuration

**For local dev:**
1. Copy `.env.example` to `.env.local`
2. Add Supabase credentials
3. Create `src/autoLoginConfig.js`:
```js
export const AUTO_LOGIN_CONFIG = {
  email: 'your-email@example.com',
  password: 'your-password'
};
```

**For Vercel:**
- Set env vars: `VITE_AUTO_LOGIN_EMAIL`, `VITE_AUTO_LOGIN_PASSWORD`
- Build script auto-generates `autoLoginConfig.js`

### Run Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy

```bash
# Push to GitHub, Vercel auto-deploys
git push origin no-login
```

---

## Key Features

### Child Mode
- Emoji-based symptom selection
- Simple intensity slider (0-10)
- Optional context (mood, energy, activity) - collapsed by default
- Photo/voice note support
- Recent entries preview

### Parent Mode
- **Home Tab**: Quick symptom log + Quick Actions (Symptoms, Export)
- **Diary Tab**: Full entry list with bulk delete, date filters
- **Analytics Tab**: Pattern detection, trends, export
- Additional context fields: food, medication
- Symptom management (add/edit/delete)
- Export: CSV + PDF

### Pattern Analysis
- Most common symptoms
- Time-of-day correlations
- Day-of-week patterns
- Environmental correlations (weather, temperature, pressure)

---

## Gotchas & Tips

### Import Paths
- Hooks are in `src/hooks/` not `src/`
- Utils are in `src/utils/` not `src/`
- Always use relative paths (`../`, `../../`) for imports

### Modal Behavior
- Modals use fixed positioning and backdrop
- Close on backdrop click via `onClose` prop
- `isOpen` prop controls visibility

### Context/Environment Capture
- `captureEnvironment()` runs on every entry save
- Requires geolocation permission
- Weather API key optional (VITE_OPENWEATHER_API_KEY)
- Gracefully fails if unavailable

### Supabase RLS
- Row Level Security enabled on all tables
- Users can only access their own data
- `auth.uid()` used in policies

### Performance
- EntriesSection lazy-loads in batches of 30
- Pattern analysis memoized with `useMemo`
- Photos compressed before upload

---

## Future Roadmap

See `IMPLEMENTATION_PLAN.md` for detailed feature roadmap including:
- Enhanced context tracking (food library, medication management)
- Advanced analytics (heatmaps, correlation analysis)
- PWA features (offline mode, push notifications)
- Doctor-ready reports

---

## Troubleshooting

### Build fails with import errors
- Check that all moved files have updated import paths
- Hooks import from `../` relative to src root
- Utils import from `../../utils/` from nested components

### Auto-login not working
- Verify `autoLoginConfig.js` exists and has correct credentials
- Check Supabase project URL and anon key in `.env.local`
- Check browser console for auth errors

### Photos not uploading
- Verify Supabase Storage bucket `symptom-photos` exists
- Check bucket is public or has correct RLS policies
- File size limit: 5MB per photo

---

## Contact & Resources

- **Supabase Dashboard**: [Your project URL]
- **Vercel Dashboard**: [Your deployment URL]
- **Main Branch**: `no-login` (production)
- **Docs**: See other `.md` files in root for specific setup guides
