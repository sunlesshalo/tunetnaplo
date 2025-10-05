# 🎯 Tünetnapló - Supabase Migráció

## ✅ Amit már megcsináltam:

### 1. **Supabase Kliens Telepítése**
- ✅ `@supabase/supabase-js` csomag telepítve
- ✅ Kliens konfiguráció elkészítve (`src/supabaseClient.js`)

### 2. **Adatbázis Séma Elkészítése**
- ✅ SQL fájl létrehozva: `supabase_schema.sql`
- ✅ 3 tábla:
  - **profiles** - Felhasználói profilok
  - **symptoms** - Tünetek
  - **entries** - Bejegyzések (tünetlógok)
- ✅ Row Level Security (RLS) policy-k - mindenki csak saját adatait látja
- ✅ Indexek optimalizálva a gyors lekérdezésekhez

### 3. **Authentication Komponens**
- ✅ Bejelentkezés/regisztráció UI elkészítve (`src/Auth.jsx`)
- ✅ Email + jelszó alapú auth
- ✅ Hibakezelés és visszajelzések

### 4. **Környezeti Változók**
- ✅ `.env` fájl létrehozva
- ✅ `.gitignore` frissítve - API kulcsok NEM kerülnek GitHub-ra
- ✅ Vite környezeti változók setup

### 5. **Dokumentáció**
- ✅ Részletes setup útmutató: `SUPABASE_SETUP.md`

---

## 📋 Mit kell NEKED csinálnod most:

### 1. **Supabase Projekt Létrehozása** (5 perc)

Kövesd a lépéseket a **`SUPABASE_SETUP.md`** fájlban:
- Regisztrálj https://supabase.com
- Hozz létre új projektet (`tunetnaplo`)
- Szerezd meg az API kulcsokat

### 2. **Környezeti Változók Kitöltése** (2 perc)

Nyisd meg a `.env` fájlt és add meg a kulcsokat:

```env
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_OPENWEATHER_API_KEY=your_openweather_key
```

### 3. **SQL Séma Futtatása** (2 perc)

Supabase Dashboard:
1. Menj a **SQL Editor**-ba
2. Másold be a `supabase_schema.sql` tartalmát
3. Kattints **Run**

### 4. **Értesíts Engem!**

Amikor minden készen van, szólj, és akkor:
- ✅ Integráljuk az App.jsx-et Supabase-zel
- ✅ Migrálunk minden localStorage adatot
- ✅ Tesztelünk

---

## 🔄 Mi fog változni az app-ban?

### Előtte (localStorage):
```javascript
localStorage.setItem('symptoms', JSON.stringify(symptoms))
```

### Utána (Supabase):
```javascript
await supabase
  .from('symptoms')
  .insert([{ user_id: user.id, name, emoji }])
```

### Előnyök:
- ✅ **Biztonságos** - adatok a felhőben
- ✅ **Több eszköz** - elérhető telefonról, laptopról
- ✅ **Automatikus backup**
- ✅ **Megosztható az orvossal** - read-only link
- ✅ **API kulcsok védve** - nem látszanak a kódban
- ✅ **Nincs adat veszteség** - még ha törölsz is cache-t

---

## 🗂️ Új fájlok a projektben:

```
Tunetnaplo/
├── .env                      # ← Környezeti változók (API kulcsok)
├── SUPABASE_SETUP.md         # ← Setup útmutató
├── supabase_schema.sql       # ← Adatbázis séma
├── src/
│   ├── supabaseClient.js     # ← Supabase kliens konfiguráció
│   └── Auth.jsx              # ← Bejelentkezés/regisztráció UI
```

---

## ⏭️ Következő lépések (amikor kész vagy):

1. **Auth integráció App.jsx-be** - ellenőrzés hogy be van-e jelentkezve
2. **CRUD műveletek átírása** - localStorage → Supabase
3. **localStorage → Supabase migráció** - meglévő adatok áttöltése
4. **Tesztelés** - minden funkció működik-e
5. **Deploy** - production build

---

## 🆘 Ha elakadtál:

Nyisd meg a **`SUPABASE_SETUP.md`** fájlt - ott minden le van írva lépésről lépésre!

**Szólj, ha kész vagy, és folytatjuk!** 🚀
