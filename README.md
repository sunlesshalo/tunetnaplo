# Tünetnapló (Early Access)

Tünetnapló segít a családoknak naplózni a tüneteket, fotókat, hangfelvételeket és környezeti adatokat. Az adatok a felhasználó saját Google Drive-jában tárolódnak - teljes adat-tulajdonjoggal és adatvédelemmel.

## Fő funkciók

- Gyors tünet rögzítés gyerekbarát felületen
- Részletes szülői mód: szerkesztés, törlés, grafikonok, export (CSV/PDF)
- Fénykép és hangjegyzet feltöltés saját Google Drive-ba
- Környezeti (időjárás, geolokáció) és hangulat adatok automatikus mentése
- Adatok mentése Google Sheets-be (automatikusan létrehozva a felhasználó Drive-jában)
- Beépített visszajelzés gomb (e-mail vagy űrlap)

## Technológia

- React 19 + Vite 7
- TailwindCSS
- Google Sheets API (adattárolás)
- Google Drive API (fényképek, hangfelvételek)
- Google OAuth 2.0 (bejelentkezés)
- Recharts + html2canvas + jsPDF a vizualizációkhoz és exporthoz

## Google Cloud Project Setup

Ahhoz, hogy az alkalmazás működjön, létre kell hozni egy Google Cloud projektet és be kell állítani a szükséges API-kat:

### 1. Google Cloud Console Setup

1. Menj a [Google Cloud Console](https://console.cloud.google.com/)-ra
2. Hozz létre egy új projektet vagy válassz egy meglévőt
3. Engedélyezd a következő API-kat:
   - Google Sheets API
   - Google Drive API

### 2. OAuth 2.0 Credentials

1. Menj a **APIs & Services > Credentials** menüpontra
2. Kattints a **Create Credentials > OAuth client ID**-ra
3. Válaszd a **Web application** típust
4. Add hozzá az engedélyezett JavaScript origins-t:
   - `http://localhost:5173` (fejlesztéshez)
   - Az éles domain (pl. `https://your-app.vercel.app`)
5. Add hozzá az engedélyezett redirect URIs-t:
   - `http://localhost:5173` (fejlesztéshez)
   - Az éles domain (pl. `https://your-app.vercel.app`)
6. Másold ki a **Client ID**-t

### 3. API Key

1. Menj a **APIs & Services > Credentials** menüpontra
2. Kattints a **Create Credentials > API key**-re
3. Másold ki az API key-t
4. (Opcionális) Korlátozd az API key használatát:
   - Application restrictions: HTTP referrers
   - API restrictions: Google Sheets API, Google Drive API

## Környezeti változók

Másold a `.env.example` fájlt `.env.local` néven, majd töltsd ki az értékeket:

```bash
cp .env.example .env.local
```

| Kulcs | Leírás |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |
| `VITE_GOOGLE_API_KEY` | Google API Key |
| `VITE_FEEDBACK_EMAIL` | *Opcionális.* A visszajelzés gomb mailto címét adja meg. |
| `VITE_FEEDBACK_FORM_URL` | *Opcionális.* Ha inkább űrlapot használsz, add meg a linket. |
| `VITE_OPENWEATHER_API_KEY` | *Ajánlott.* Az időjárási metaadatokhoz. |

## Fejlesztői parancsok

```bash
npm install
npm run dev      # helyi fejlesztés (http://localhost:5173)
npm run build    # produkciós build (vite build)
npm run preview  # build megtekintése
```

## Hogyan működik az adattárolás?

### Google Sheets
Az alkalmazás automatikusan létrehoz egy "Tünetnapló" nevű Google Sheets táblázatot a felhasználó Drive-jában első használatkor. Ez a táblázat két lapot tartalmaz:
- **Symptoms**: A felhasználó által létrehozott tünetek listája
- **Entries**: A naplóbejegyzések

### Google Drive
A fényképek és hangfelvételek a felhasználó Google Drive-jában tárolódnak a következő mappaszerkezetben:
- `Tünetnapló/photos` - Feltöltött fényképek
- `Tünetnapló/voice` - Hangfelvételek

### Adatvédelem
- Minden felhasználó a saját Google fiókjába jelentkezik be
- Az adatok kizárólag a felhasználó saját Google Drive-jában tárolódnak
- Az alkalmazás nem fér hozzá más felhasználók adataihoz
- A felhasználó bármikor törölheti az adatokat a saját Drive-jából

## Early access forgatókönyv

1. **Google Cloud projekt** – Állítsd be a fenti lépések szerint. Győződj meg róla, hogy a megfelelő OAuth redirect URI-k be vannak állítva.
2. **Tesztelői fiókok** – A felhasználók a saját Google fiókjukkal jelentkeznek be. Nincs szükség külön fiókkezelésre.
3. **Konfiguráció** – Állítsd be a fenti env változókat helyi környezetben és a hoston (pl. Vercel).
4. **Build & deploy** – Telepítsd az alkalmazást (pl. `npm run build` + Vercel). Ellenőrizd mobil böngészőkben (iOS Safari, Android Chrome).
5. **Onboarding** – Küldd ki az instrukciókat a tesztelőknek (lásd alább). Emeld ki a visszajelzés gombot és a támogatási e-mail címet.
6. **Megfigyelés** – Kövesd a böngésző console-ban az esetleges hibákat. Javasolt Sentry/LogRocket integráció (nem része a repo-nak).

### Tesztelői útmutató (ajánlott e-mail melléklet)

1. Nyisd meg az alkalmazást és kattints a "Bejelentkezés Google-lel" gombra.
2. Jelentkezz be a saját Google fiókoddal. Az alkalmazás engedélyt fog kérni a Google Sheets és Drive eléréséhez.
3. A gyerek nézetben válassz tünetet, állíts erősséget, adj jegyzetet, készíts fotót vagy hangot.
4. A szülői nézetben (jobb felső sarok → „Szülő mód") szerkesztheted vagy törölheted a bejegyzéseket.
5. Nézd meg a Mintázatok fület a napi/heti összegzéshez.
6. Exportáld az adatokat PDF vagy CSV formátumban.
7. Az adataidat megtalálod a saját Google Drive-odban a "Tünetnapló" nevű táblázatban és mappában.
8. Ha hibát találsz, kattints a „Visszajelzés" gombra vagy írj a megadott címre.

## Ismert korlátok

- Az időjárási adatokhoz internetkapcsolat és érvényes OpenWeather API kulcs kell; hiba esetén a rögzítés továbbra is működik.
- A Google Drive ingyenes tárhelye korlátozott (15 GB). Nagy felbontású fotók növelhetik a tárhely használatát.
- A böngésző engedélykérései (kamera/mikrofon) manuális jóváhagyást igényelnek.
- Az adatok frissítése nem valós idejű - az alkalmazás 30 másodpercenként frissíti az adatokat. Frissítsd az oldalt a legfrissebb adatokért.

## Hibajelentés

Állítsd be a `VITE_FEEDBACK_EMAIL` vagy `VITE_FEEDBACK_FORM_URL` változót. A felhasználók a felületről is elérik a visszajelzés gomb segítségével.

## Deployment (Vercel)

1. Push-old a kódot GitHub-ra
2. Import-áld a projektet Vercel-be
3. Állítsd be a környezeti változókat a Vercel dashboard-on
4. Az OAuth redirect URI-k közé add hozzá a Vercel domain-t (pl. `https://your-app.vercel.app`)
5. Deploy!

**Fontos**: Az OAuth redirect URI-knak pontosan egyezniük kell a Google Cloud Console-ban beállított értékekkel.

---

Kérdés vagy ötlet esetén nyiss issue-t a GitHub-on vagy küldj e-mailt a megadott címre. Jó tesztelést!
