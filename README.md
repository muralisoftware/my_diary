# 📔 My Diary — Private Offline-First Personal Journal Mobile App

A mindful, offline-first personal diary and journal mobile application built with **React Native**, **Expo**, and **TypeScript**. Designed for privacy, calm reflection, and emotional wellness without any backend servers, Supabase, cloud accounts, or third-party telemetry. All entries, moods, memories, and security credentials stay exclusively on the user's personal device.

---

## 🌟 Live Preview & Ports

| Service | Address | Technology | Description |
| :--- | :--- | :--- | :--- |
| **Mobile App (Web Preview)** | [http://localhost:8086](http://localhost:8086) | React Native + Expo 52 + Lucide Native | Interactive Mobile Journal in browser |
| **Native Mobile (Android / iOS)** | Metro `exp://192.168.1.34:8086` | Expo Go / Native Build | Scan QR code in Expo Go app |

---

## 🧘 Key Clinical & Mindful Features

1. **100% Offline & Private**:
   - Zero remote database servers, accounts, or cloud logins.
   - All reflections and security keys are stored locally on the device with zero tracking.
2. **5-Tab Navigation**:
   - **Home**: Daily writing streak banner, today's mood badge, monthly reflection counter, daily inspirational prompt, and recent journal cards.
   - **Calendar**: Interactive monthly calendar with colored mood dots for days with reflections, day-by-day browsing, and **"On This Day"** historical memory flashcard.
   - **Write (Elevated Center Action)**: Dedicated mindful editor with title, auto date & time, 6-mood selector, tags management, draft autosave recovery, and word counter.
   - **Memories & Insights**: Visual mood analytics, emotional wellness breakdown percentage bars, dominant mood detection, tag clouds, and starred memories collection.
   - **Settings**: Theme switcher, PIN security setup, offline JSON backup export/restore, and printable markdown book archive.
3. **Privacy & Security Protection**:
   - 4-digit PIN passcode lock screen with custom numerical keypad.
   - Salted `SHA-256` cryptographic hashing.
   - Optional biometric unlock (Face ID / Fingerprint).
   - Secure recovery question mechanism in case the user forgets their passcode.
   - Immediate lock action from the navigation header.
4. **Four Mindful Aesthetic Themes**:
   - **Pure White**: Crisp minimalist white canvas, high-contrast dark typography, elegant violet accents.
   - **Warm Journal**: Cream paper background, sepia typography, amber accents for vintage notebook warmth.
   - **Calm Lavender**: Peaceful lilac pastel palette with royal violet accents for serene reflection.
   - **Midnight Diary**: Deep dark slate with warm golden accents for comfortable nighttime journaling.
5. **Autosave Draft Recovery**:
   - Automatically saves uncommitted drafts as you type so you never lose unfinished thoughts if interrupted.
6. **Data Sovereignty & Portability**:
   - One-tap full JSON database export.
   - Full JSON restore and validation tool.
   - Printable Markdown generator to view your journal as a continuous book.

---

## 📁 Project Architecture & Folder Structure

```
personal_diary/
├── App.tsx                       # Master Application Container, Guard & 5-Tab Router
├── package.json                  # Expo 52, React Native 0.76, Lucide Native, date-fns
├── app.json                      # Expo App configuration & metadata
├── tsconfig.json                 # Strict TypeScript configuration
├── babel.config.js               # Babel setup
├── index.js                      # Root application entry (registerRootComponent)
├── assets/                       # App icons, splash screens, favicon
└── src/
    ├── types/
    │   └── diary.ts              # Typed interfaces for Entries, Moods, Themes, Security
    ├── constants/
    │   ├── theme.ts              # Color definitions for Warm Journal, Lavender, Midnight
    │   ├── moods.ts              # 6 Mood definitions (Happy, Calm, Excited, Neutral, Sad, Stressed)
    │   └── prompts.ts            # Curated inspirational daily writing prompts
    ├── database/
    │   ├── db.ts                 # Local storage engine, initial sample seeder & draft cache
    │   └── diaryRepository.ts    # CRUD methods, keyword search, streak calculation, mood stats
    ├── services/
    │   ├── securityService.ts    # Salted SHA-256 PIN hashing, verification, recovery & auto-lock
    │   └── exportService.ts      # Portable JSON backup generator, validator & Markdown exporter
    ├── context/
    │   ├── ThemeContext.tsx      # Theme state and persistence (Warm, Lavender, Midnight)
    │   ├── SecurityContext.tsx   # Lock screen state, PIN unlock, biometric trigger
    │   └── DiaryContext.tsx      # Global journal entries, active modals & filter states
    ├── components/
    │   ├── common/
    │   │   ├── Header.tsx        # Top header with streak pill, title, search & lock icons
    │   │   ├── MoodBadge.tsx     # Color-coded mood badge chip with emoji
    │   │   └── TagChip.tsx       # Mindful topic tag pill with remove action
    │   ├── diary/
    │   │   ├── DiaryCard.tsx     # Paper-like card with date, mood, title, snippet & star
    │   │   ├── MoodSelector.tsx  # 6-mood horizontal interactive selector strip
    │   │   └── WritingPromptCard.tsx # Daily inspirational prompt with 1-click reflection
    │   └── calendar/
    │       ├── CalendarGrid.tsx  # Month calendar with entry dots and active day selection
    │       └── OnThisDayCard.tsx # Historical recall from previous years or months
    └── screens/
        ├── LockScreen.tsx        # Numerical PIN keypad screen with shake error & recovery
        ├── HomeScreen.tsx        # Home dashboard with greeting, streak, mood, prompt, recent cards
        ├── CalendarScreen.tsx    # Monthly calendar, day timeline, "On this day" flashcard
        ├── EditorModal.tsx       # Rich journal editor with autosave drafts, tags & word count
        ├── MemoriesScreen.tsx    # Mood breakdown charts, dominant mood, tags cloud, starred memories
        ├── SearchModal.tsx       # Live keyword search with mood, favorite, and tag filters
        ├── SettingsScreen.tsx    # Theme switcher, PIN security, JSON backup export/restore
        ├── PinSetupModal.tsx     # PIN setup, confirmation, and recovery question form
        └── DiaryDetailModal.tsx  # Full-screen mindful reading view with edit, star, share & delete
```

---

## 🚀 Running the App

### 1. Web Preview Mode (Port 8086)
```bash
cd /var/www/html/personal/personal_diary
npm run web
```
Then visit **[http://localhost:8086](http://localhost:8086)** in your web browser.

### 2. Mobile Device Preview via Expo Go
```bash
cd /var/www/html/personal/personal_diary
npx expo start
```
Scan the displayed QR code with the **Expo Go** app on your iPhone or Android phone.
