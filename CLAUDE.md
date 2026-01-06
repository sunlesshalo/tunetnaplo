# CLAUDE.md

## Project Context

**Project:** Tünetnapló (Symptom Tracker)
**Stack:** React 19, Vite, Tailwind CSS, Google Sheets API, Google Drive API
**Deployment:** Vercel (https://tunetnaplo.vercel.app)

Key `.env` variables:
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_GOOGLE_API_KEY` - Google API key for Sheets/Drive
- `VITE_OPENWEATHER_API_KEY` - Optional, for weather capture

---

## Mandatory Protocol

### Session Start
Use `/start` command OR read memory/ files:
- Current focus from STATE.json
- Session history and notes from CONTEXT.md
- Recent git history (for archived context)

### During Session
| Event | Action |
|-------|--------|
| Discover something | Log to CONTEXT.md (use log-context skill) |
| Solve an error | Log to CONTEXT.md (use log-context skill) |
| Complete a task | Update STATE.json **immediately** |
| Need a procedure | Check `.claude/skills/` for applicable skill |
| Hit a familiar issue | Search CONTEXT.md first (use recall-context skill) |

### Session End
Use `/checkpoint` command OR:
1. Update CONTEXT.md with session summary
2. Update STATE.json task statuses
3. Git commit with descriptive message

---

## Anti-Circle Rule

Before solving any problem:
```bash
grep -ri "keyword" memory/
```
If already solved, use existing solution from CONTEXT.md notes.

---

## Memory Files

| File | Purpose |
|------|---------|
| `STATE.json` | Task tracking - the source of truth |
| `CONTEXT.md` | Session history + notes (errors, discoveries, decisions) |

---

## Memory Archiving

Based on Anthropic's research: git history IS the archive. Keep active memory lean.

**Principle:**
- Don't delete completed items, commit them first
- Git commits = primary archive (searchable, rollback-capable)
- Active files should only contain recent/relevant context

**When to archive (use `archive-memory` skill):**
- Weekly maintenance
- When CONTEXT.md exceeds ~300 lines
- When STATE.json has many completed tasks

**Finding archived content:**
```bash
git log --grep="Archive:" --oneline
git log -p --all -S "keyword" -- memory/
```

---

## Skills

Skills in `.claude/skills/` are auto-discovered based on their descriptions.

**Built-in memory skills:**
- `log-context` - Auto-log discoveries, errors, and decisions to CONTEXT.md
- `recall-context` - Search past context before debugging or deciding
- `archive-memory` - Archive old sessions to git history, keep active memory lean

**How skills work:**
- Each skill is a self-contained folder with `SKILL.md` and optional `scripts/`
- Claude reads the `description` field to determine when a skill applies
- Skills bundle their own scripts for portability

**To create a new skill:**
1. Copy `.claude/skills/_template/` to `.claude/skills/your-skill-name/`
2. Edit `SKILL.md` with your procedure
3. Add any scripts to `scripts/` subfolder

---

## Key Rules

1. **Never start work without reading memory/**
2. **Document immediately, not at session end**
3. **Search CONTEXT.md before debugging**
4. **Check skills before creating new procedures**
5. **No hardcoded secrets - use .env**

---

## Architecture

### Dual-Mode System

The app has two distinct user experiences:

1. **Child View** (`/`) - Simplified, emoji-heavy, quick logging
2. **Parent View** (`/szulo`) - Full features, analytics, management (PIN-protected optional)

### Data Storage (Privacy-First)

- **Google Sheets** - Symptom and entry data (user owns their data)
- **Google Drive** - Photos and voice notes
- **localStorage** - Settings (theme, name, PIN)

### Key Design Patterns

- **Component Organization**: Features grouped by concern (entries, symptoms, stats, etc.)
- **Hooks**: Data fetching (`useGoogleData`), form state (`useEntryModal`), settings (`useSettings`)
- **Theme**: CSS custom properties in `:root`, 5 color themes (sky, emerald, violet, rose, amber)

---

## File Structure

```
src/
├── App.jsx                      # Auth + routing
├── googleClient.js              # Google OAuth/API setup
├── components/
│   ├── layout/                  # Header, ParentBottomNav
│   ├── shared/                  # SectionTitle, SettingsModal, etc.
│   ├── entries/                 # EntryCard, EntriesSection, LogModal
│   ├── symptoms/                # AddSymptomTab
│   ├── stats/                   # PatternsTab
│   └── views/
│       ├── ChildView.jsx
│       ├── ParentView.jsx
│       ├── HomeTab.jsx
│       └── parent-tabs/
├── hooks/
│   ├── useGoogleData.js         # Symptoms & entries CRUD
│   ├── useEntryModal.js         # Entry form state management
│   └── useSettings.js           # Theme, name, PIN
├── utils/
│   ├── helpers.js               # captureEnvironment, confirmDeleteEntry
│   ├── constants.js             # EMOJI_SET
│   ├── patternAnalysis.js       # Pattern detection
│   └── storageHelpers.js        # Photo/voice upload
├── services/
│   └── googleSheetsService.js   # Sheets API wrapper
└── index.css                    # Theme CSS custom properties
memory/
├── STATE.json                   # Task tracking
└── CONTEXT.md                   # Session history + notes
```

---

## Common Tasks

### Adding a New Component

1. Place in appropriate directory (`components/[category]/`)
2. Import where needed
3. Keep components small (<300 lines ideally)

### Modifying Theme Colors

1. Update CSS custom properties in `src/index.css` under `[data-theme="..."]`
2. Use theme utility classes: `bg-theme`, `text-theme`, `hover:bg-theme-dark`, etc.

### Adding a New Setting

1. Add to `DEFAULT_SETTINGS` in `src/hooks/useSettings.js`
2. Add setter callback
3. Update `SettingsModal.jsx` UI

### Data Flow

```
Google Sheets → useGoogleData hooks → View components → UI
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
cp .env.example .env
# Add your Google API credentials to .env
```

### Run Dev Server

```bash
npm run dev
```

### Build & Deploy

```bash
npm run build
git push  # Vercel auto-deploys from main
```

---

## Key Features

### Child Mode
- Emoji-based symptom selection
- Simple intensity slider (0-10)
- Optional context (mood, energy, activity) - collapsed by default
- Photo/voice note support
- Theme color picker

### Parent Mode
- **Home Tab**: Quick symptom log + Quick Actions
- **Symptoms Tab**: Add/edit/delete symptoms
- **Entries Tab**: Full entry list with bulk delete, date filters
- **Patterns Tab**: Pattern detection, trends
- **Export Tab**: CSV + PDF export
- Additional context fields: food, medication

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
- Always use relative paths for imports

### Google OAuth
- Account picker: `prompt: 'select_account'` in googleClient.js
- Must add domains to Google Cloud Console authorized origins

### Theme System
- CSS custom properties: `--theme-color` and `--theme-color-dark`
- Theme set via `data-theme` attribute on document root
- Utility classes defined in `index.css`

### Photos & Voice Notes
- Stored in user's Google Drive
- Private by default (owner access only)
- Thumbnails via Drive thumbnail API
- Voice playback via authenticated fetch → blob URL

### Performance
- EntriesSection lazy-loads in batches of 30
- Pattern analysis memoized with `useMemo`
- Photos compressed before upload
