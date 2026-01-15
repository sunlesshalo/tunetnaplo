# Tünetnapló

Gyerekbarát tünetnapló alkalmazás, amely segít a családoknak nyomon követni a gyermekek tüneteit. Az adatok a felhasználó saját Google Drive-jában tárolódnak - teljes adatvédelemmel.

**Demo:** [tunetnaplo.vercel.app](https://tunetnaplo.vercel.app)

## Funkciók

### Gyerek nézet
- Egyszerű, emoji-alapú tünetválasztás
- Intenzitás csúszka (0-10)
- Fénykép és hangfelvétel
- Hangulat, energia, aktivitás rögzítése
- Személyre szabható színtémák

### Szülő nézet
- Teljes bejegyzés kezelés (szerkesztés, törlés)
- Dátum/idő szerkesztés (utólagos rögzítéshez)
- Mintázatok és trendek elemzése
- CSV és PDF export
- Étkezés és gyógyszer jegyzetek

### PWA támogatás
- Telepíthető a kezdőképernyőre (iOS/Android)
- Teljes képernyős alkalmazás élmény
- Offline figyelmeztetés

## Telepítés

### 1. Google Cloud projekt létrehozása

1. Menj a [Google Cloud Console](https://console.cloud.google.com/)-ra
2. Hozz létre új projektet
3. Engedélyezd:
   - Google Sheets API
   - Google Drive API
4. Hozz létre OAuth 2.0 Client ID-t (Web application)
5. Hozz létre API Key-t

### 2. Helyi fejlesztés

```bash
git clone https://github.com/sunlesshalo/tunetnaplo.git
cd tunetnaplo
npm install
cp .env.example .env.local
# Töltsd ki az .env.local fájlt
npm run dev
```

### 3. Környezeti változók

| Változó | Leírás | Kötelező |
|---------|--------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Igen |
| `VITE_GOOGLE_API_KEY` | Google API Key | Igen |
| `VITE_FORMSPREE_ID` | Formspree form ID a visszajelzéshez | Nem |
| `VITE_OPENWEATHER_API_KEY` | OpenWeather API az időjárás adatokhoz | Nem |

### 4. Vercel deployment

1. Push a GitHub-ra
2. Import a Vercel-be
3. Állítsd be a környezeti változókat
4. Google Cloud Console-ban add hozzá a Vercel domain-t az OAuth origins-hez

## Adattárolás

### Google Sheets
Az alkalmazás automatikusan létrehoz egy "Tünetnapló" táblázatot:
- **Symptoms** lap: tünetek listája
- **Entries** lap: naplóbejegyzések
- **Settings** lap: megosztott beállítások (név, téma)

### Google Drive
Médiafájlok tárolása:
- `Tünetnapló/photos/` - fényképek
- `Tünetnapló/voice/` - hangfelvételek

### Adatvédelem
- Minden adat a felhasználó saját Google fiókjában
- Az alkalmazás nem fér hozzá más felhasználók adataihoz
- A felhasználó bármikor törölheti az adatokat

## Technológia

- React 19 + Vite
- TailwindCSS
- Google Sheets/Drive API
- Recharts (grafikonok)
- html2canvas + jsPDF (export)

## PWA telepítés

### iPhone/iPad
1. Nyisd meg Safari-ban
2. Koppints a Megosztás ikonra
3. Válaszd: "Hozzáadás a főképernyőhöz"

### Android
1. Nyisd meg Chrome-ban
2. Koppints a menüre (⋮)
3. Válaszd: "Alkalmazás telepítése"

## Fejlesztői parancsok

```bash
npm run dev      # fejlesztői szerver
npm run build    # production build
npm run preview  # build előnézet
```

## Közreműködés

Kérdés vagy javaslat esetén használd az alkalmazás "Visszajelzés" gombját vagy nyiss GitHub issue-t.

---

MIT License
