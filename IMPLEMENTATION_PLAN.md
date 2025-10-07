# Tünetnapló – Early Access Action Plan

This branch tracks everything needed for the limited beta (5–10 család) and the follow-up work. Use it as a living checklist while the pilot is running.

---

## 1. Pre-launch (complete in repo)
- ✅ Improve üres állapotok: gyors kezdő kártya, tünet felvétel CTA
- ✅ Beépített visszajelzés gomb (env minimális beállítással)
- ✅ `.env.example` a kötelező/ opcionális kulcsokkal
- ✅ README frissítés early-access útmutatóval

## 2. Pre-launch (owner tasks)
1. **Supabase**
   - Kapcsold ki a publikus sign-up-ot, RLS minden táblán
   - Tároló bucket jogosultságok: csak saját objektum olvasható/ írható
   - Hozz létre meghívó e-maileket vagy magic linket a családoknak
2. **Környezet**
   - Töltsd ki a `.env.local`-t, majd állítsd be ugyanezeket a változókat a hoston (Vercel)
   - Hagyd üresen az `VITE_AUTO_LOGIN_*` mezőket, ha nincs szükség hardkódolt accountokra
   - Adj meg `VITE_FEEDBACK_EMAIL` vagy `VITE_FEEDBACK_FORM_URL` értéket
3. **Előkészítő adat**
   - (Opcionális) Seedelj 3-5 gyakori tünetet minden tesztfiókhoz
   - Ellenőrizd az OpenWeather API key-t (limit, számlázás)

## 3. Teszt futtatása
- Küldd ki az onboarding üzenetet (README „Tesztelői útmutató” alapján)
- Figyeld a Supabase táblákat, storage használatot, hiba logokat
- Gyűjts visszajelzést a beépített gombon keresztül
- Dokumentáld a talált hibákat és a reprodukciós lépéseket (GitHub issues)

## 4. Teszt lezárása
1. Exportálj minden fiók adatát (CSV/PDF funkciók + Supabase backup)
2. Töröld a teszt fiókokat és a storage objektumokat
3. Fordítsd vissza a változtatásokat (auto-login env, stb.), majd árnyald a roadmapet a visszajelzések alapján

---

### Megfigyelési tippek
- `patterns` grafikon + export funkció: legalább egyszer teszteld minden böngészőn
- Media upload: figyeld a storage/ bandwidth limitet
- Ha webkit (Safari) problémát tapasztalsz, rögzítsd a User-Agentet és a hibakódot

### Kapcsolat
- Support: állítsd be az `VITE_FEEDBACK_EMAIL` címet
- Hibák: GitHub issue vagy közvetlen e-mail a fenti címre

Frissítsd ezt a dokumentumot, ha új feladat vagy észrevétel merül fel a pilot során.
