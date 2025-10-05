# Tünetnapló - Implementation Plan
## Enhanced Feature Roadmap

---

## PHASE 1: Context & Triggers (PRIORITY)

### 1.1 Child Mode Context (Simple, No Fatigue)
**Goal:** Quick 1-2 tap context logging that doesn't slow down symptom entry

**Implementation:**
- Add optional "context panel" below symptom intensity slider
- Large, colorful emoji buttons (max 4-5 visible at once)
- Single-tap selection, multiple allowed
- Auto-saves with symptom entry

**Context Categories (Child Mode):**
```javascript
MOOD: 😊 Jó, 😐 Oké, 😢 Szomorú, 😠 Mérges
ENERGY: ⚡ Energikus, 😴 Fáradt, 🥱 Nagyon fáradt
ACTIVITY: 🏃 Mozgás, 📚 Tanulás, 🎮 Játék, 🛏️ Pihenés
```

**UI Design:**
- Collapsible section (closed by default)
- "Hogy érzed magad?" toggle button
- When opened: 3 rows of large emoji buttons
- Selected = highlighted with border
- No required fields

### 1.2 Parent Mode - Full Trigger System
**Goal:** Detailed tracking without cluttering child's experience

**Additional Triggers (Parent Only):**
```javascript
FOOD:
  - Quick select from 9 safe foods
  - "New food" option with text input
  - Time since eating (30min, 1h, 2h+)

MEDICATION:
  - Medication list (parent-managed)
  - Dosage + time taken
  - "Did it help?" feedback on next log

ENVIRONMENT:
  - Weather: ☀️ Napos, ☁️ Felhős, 🌧️ Esős
  - Temperature: 🥵 Meleg, 😎 Normál, 🥶 Hideg
  - Location: Otthon, Iskola, Kint, Egyéb

STRESS/EVENTS:
  - Free text field
  - Common tags: "Iskola", "Látogatás", "Utazás"
```

**Data Model Update:**
```javascript
entry: {
  id, date, timestamp, symptomId, intensity, duration, note,
  // NEW FIELDS:
  context: {
    mood?: string,      // emoji key
    energy?: string,    // emoji key
    activity?: string,  // emoji key
  },
  triggers?: {
    foods?: [{ name, timeBefore }],
    medications?: [{ name, dose, timeTaken }],
    environment?: { weather, temp, location },
    stress?: string,
  }
}
```

---

## PHASE 2: Medication Management

### 2.1 Medication Library (Parent Mode Only)
- Add/edit/delete medications
- Name, typical dosage, notes
- Stored separately from entries

### 2.2 Medication Logging
**Parent Mode:**
- Select from library + dosage + time
- Optional: "Preventative" or "Treatment"

**Integration:**
- Show in entry timeline
- Export includes medication data
- Analytics: symptom relief correlation

### 2.3 Effectiveness Tracking
- After logging medication, prompt on next symptom:
  - "Did [medication] help?" Yes/No/Somewhat
- Show effectiveness stats in parent analytics

---

## PHASE 3: Food Tracking (Parent Mode Only)

### 3.1 Safe Foods Management
- Parent-managed list of 9 safe foods
- Add/edit with emoji icons
- Quick-select buttons when logging

### 3.2 New Food Trials
- "Trying new food" checkbox
- Name + reaction tracking
- Flag suspicious foods

### 3.3 Food-Symptom Correlation
- Show which foods preceded symptoms
- Time-based analysis (within 30min, 1h, 2h, 4h)
- Export food diary for doctor

---

## PHASE 4: Enhanced Analytics

### 4.1 Pattern Detection
- Most common symptom times (hour of day)
- Day-of-week patterns
- Symptom duration averages
- Intensity trends over time

### 4.2 Trigger Correlation Analysis
**Parent View Only:**
```
"Fejfájás occurs 70% after dairy"
"Symptoms 2x more likely when tired"
"Outdoor activity reduces symptoms by 30%"
```

### 4.3 Visual Analytics
- Heatmap calendar (color = severity)
- Time-of-day chart
- Trigger frequency charts
- Monthly comparison view

### 4.4 Custom Date Ranges
- "Last 7 days", "Last 30 days", "Custom range"
- Filter by symptom type
- Filter by trigger

---

## PHASE 5: Media & Rich Context

### 5.1 Photo Attachments
- Camera/gallery picker
- Attach to entries (optional)
- Thumbnail in timeline
- Full view on tap
- Include in PDF exports

### 5.2 Voice Notes (Future)
- Quick voice memo button
- Auto-transcription (if possible)
- Playback in timeline
- Useful for 7yo vs typing

---

## PHASE 6: Smart Features

### 6.1 Reminders
- Daily check-in notification
- Medication reminders
- Custom reminder times
- Parent-configured only

### 6.2 Quick Actions
- "Duplicate last entry" button
- Templates for common symptoms
- "Same as yesterday" shortcut

### 6.3 Insights & Suggestions
- "You haven't logged today"
- "Symptoms increased this week"
- "Try noting what he ate before symptoms"

---

## PHASE 7: Doctor-Ready Reports

### 7.1 Enhanced PDF Export
- Cover page with summary stats
- Charts included (bar/line graphs)
- Date range selection
- Filtered by symptom or trigger
- Professional formatting

### 7.2 Summary Statistics
```
Report for: 2025-01-01 to 2025-01-31

Total Entries: 45
Most Common Symptom: Fejfájás (15x)
Average Intensity: 6.2/10
Peak Times: 14:00-16:00 (35% of symptoms)

Top Triggers:
- Tired: 60% correlation
- After dairy: 40% correlation
- Hot weather: 25% correlation
```

### 7.3 Medication Report
- List of all medications taken
- Dosages and frequencies
- Effectiveness ratings
- Side effects noted

---

## PHASE 8: PWA & Mobile Experience

### 8.1 Progressive Web App
- Installable on home screen
- Offline functionality
- App-like experience
- Auto-sync when online

### 8.2 Push Notifications
- Daily reminder
- "Time to check in!"
- Medication reminders

### 8.3 Camera Integration
- Direct camera access
- Quick photo for rashes/symptoms

---

## Implementation Order (Recommended)

### Sprint 1 (Week 1): Core Context
- [ ] Child mode: Simple context buttons (mood, energy, activity)
- [ ] Parent mode: Extended trigger UI
- [ ] Update data model
- [ ] Test with real usage

### Sprint 2 (Week 2): Food & Medication
- [ ] Parent mode: Food library (9 safe foods)
- [ ] Parent mode: Medication library
- [ ] Food/med logging in entries
- [ ] Update export to include triggers

### Sprint 3 (Week 3): Analytics
- [ ] Pattern detection algorithms
- [ ] Correlation analysis
- [ ] Visual charts (heatmap, time-of-day)
- [ ] Insights dashboard

### Sprint 4 (Week 4): Rich Media
- [ ] Photo attachments
- [ ] Enhanced timeline view
- [ ] PDF with images

### Sprint 5 (Week 5): Smart Features
- [ ] Reminders system
- [ ] Quick actions (duplicate, templates)
- [ ] Insights engine

### Sprint 6 (Week 6): Doctor Reports
- [ ] Enhanced PDF with charts
- [ ] Summary statistics
- [ ] Date range filtering
- [ ] Professional formatting

### Sprint 7 (Week 7): PWA
- [ ] Service worker setup
- [ ] Offline storage
- [ ] Install prompts
- [ ] Push notifications

---

## Design Principles

1. **Child Mode = Zero Friction**
   - Optional context, never required
   - Big buttons, no typing
   - Max 3 taps to log symptom

2. **Parent Mode = Medical-Grade**
   - Detailed tracking available
   - All features accessible
   - Export-ready data

3. **Progressive Enhancement**
   - Core features work first
   - Advanced features don't break simple flow
   - Graceful degradation

4. **Privacy First**
   - All data local (localStorage)
   - No cloud unless requested
   - Export = user controls data

---

## Technical Notes

### State Management
- Consider Context API or Zustand for complex state
- Separate stores for symptoms, entries, foods, meds

### Performance
- Virtualized lists for long entry history
- Lazy load analytics charts
- Optimize image uploads (compression)

### Accessibility
- Large touch targets (min 44x44px)
- High contrast colors
- Screen reader support
- Simple language for 7yo

### Data Migration
- Version localStorage keys
- Migration scripts for schema changes
- Backup/restore functionality

---

## Success Metrics

- **Child engagement**: Can log in <10 seconds
- **Parent insights**: Clear trigger patterns visible
- **Medical value**: Doctors find reports useful
- **Data quality**: 80%+ entries have context
- **Usability**: 7yo can use independently

---

## Future Ideas (Post-MVP)

- Multi-language support
- Share reports via email
- Integration with health apps
- Symptom prediction ML
- Caregiver collaboration (multiple parents)
- School nurse access (read-only)

---

**Ready to start with Sprint 1?** 🚀
