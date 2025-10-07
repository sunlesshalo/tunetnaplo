# Tünetnapló (Early Access)

Tünetnapló segít a családoknak naplózni a tüneteket, fotókat, hangfelvételeket és környezeti adatokat. Ez az „early access” ág 5-10 család terepi tesztjére készült, ezért a stabil funkciók mellett extra eszközöket is tartalmaz a visszajelzéshez.

## Fő funkciók

- Gyors tünet rögzítés gyerekbarát felületen
- Részletes szülői mód: szerkesztés, törlés, grafikonok, export (CSV/PDF)
- Fénykép és hangjegyzet feltöltés Supabase Storage-ba
- Környezeti (időjárás, geolokáció) és hangulat adatok automatikus mentése
- Tömeges törlés a naplóban a gyors adatkezeléshez
- Beépített visszajelzés gomb (e-mail vagy űrlap)

## Technológia

- React 19 + Vite 7
- TailwindCSS
- Supabase (Auth, Postgres, Storage, Realtime)
- Recharts + html2canvas + jsPDF a vizualizációkhoz és exporthoz

## Környezeti változók

Másold a `.env.example` fájlt `.env.local` néven, majd töltsd ki az értékeket:

```bash
cp .env.example .env.local
```

| Kulcs | Leírás |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase projekt URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon kulcs |
| `VITE_AUTO_LOGIN_EMAIL`, `VITE_AUTO_LOGIN_PASSWORD` | *Opcionális.* Csak helyi demóra. Hagyd üresen éles teszthez. |
| `VITE_FEEDBACK_EMAIL` | *Opcionális.* A visszajelzés gomb mailto címét adja meg. |
| `VITE_FEEDBACK_FORM_URL` | *Opcionális.* Ha inkább űrlapot használsz, add meg a linket. |
| `VITE_OPENWEATHER_API_KEY` | *Ajánlott.* Az időjárási metaadatokhoz.

## Fejlesztői parancsok

```bash
npm install
npm run dev      # helyi fejlesztés (http://localhost:5173)
npm run build    # produkciós build (vite build)
npm run preview  # build megtekintése
```

## Early access forgatókönyv

1. **Supabase projekt** – Engedélyezd az RLS-t a táblákon, hozz létre tároló bucketet a fotóknak/hangoknak. Kapcsold ki a publikus regisztrációt, használj meghívó e-mailt vagy magic linket.
2. **Teszt fiókok** – Hozz létre külön e-mailt minden családnak. Szükség esetén tölts fel kiinduló tüneteket.
3. **Konfiguráció** – Állítsd be a fenti env változókat helyi környezetben és a hoston (pl. Vercel). Az `VITE_AUTO_LOGIN_*` mezőket hagyd üresen.
4. **Build & deploy** – Telepítsd az alkalmazást (pl. `npm run build` + Vercel). Ellenőrizd mobil böngészőkben (iOS Safari, Android Chrome).
5. **Onboarding** – Küldd ki az instrukciókat a családoknak (lásd alább). Emeld ki a visszajelzés gombot és a támogatási e-mail címet.
6. **Megfigyelés** – Kövesd Supabase-ben az error logokat, storage használatot. Javasolt Sentry/LogRocket integráció (nem része a repo-nak).
7. **Lezárás** – A tesztidőszak végén exportáld az adatokat, töröld a fiókokat, ürítsd a storage bucketet.

### Tesztelői útmutató (ajánlott e-mail melléklet)

1. Jelentkezz be az általad kapott e-mail/jelszó párossal.
2. A gyerek nézetben válassz tünetet, állíts erősséget, adj jegyzetet, készíts fotót vagy hangot.
3. A szülői nézetben (jobb felső sarok → „Szülő mód”) szerkesztheted vagy törölheted a bejegyzéseket.
4. Nézd meg a Mintázatok fület a napi/ heti összegzéshez.
5. Exportáld az adatokat PDF vagy CSV formátumban.
6. Ha hibát találsz, kattints a „Visszajelzés” gombra vagy írj a megadott címre.

## Ismert korlátok

- Az időjárási adatokhoz internetkapcsolat és érvényes OpenWeather API kulcs kell; hiba esetén a rögzítés továbbra is működik.
- Nagy felbontású fotók növelhetik a Supabase tárhely használatát. Javasolt figyelni a quota-t.
- A böngésző engedélykérései (kamera/mikrofon) manuális jóváhagyást igényelnek.

## Hibajelentés

Állítsd be a `VITE_FEEDBACK_EMAIL` vagy `VITE_FEEDBACK_FORM_URL` változót. A felhasználók a felületről is eléred a visszajelzés gomb segítségével.

---

Kérdés vagy ötlet esetén nyiss issue-t a GitHub-on vagy küldj e-mailt a fenti címre. Jó tesztelést!
