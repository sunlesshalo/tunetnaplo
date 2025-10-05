# 🚀 Supabase Setup Útmutató - Tünetnapló

## 1️⃣ Supabase Projekt Létrehozása

1. Menj a **https://supabase.com** oldalra
2. Kattints **"Start your project"** → Sign in with GitHub
3. Kattints **"New Project"**
4. Töltsd ki:
   - **Name**: `tunetnaplo`
   - **Database Password**: Válassz egy erős jelszót és **MENTSD EL!**
   - **Region**: Europe (West) - Frankfurt vagy London
5. Kattints **"Create new project"**
6. ⏳ Várj ~2 percet, amíg a projekt létrejön

---

## 2️⃣ API Kulcsok Megszerzése

Miután a projekt készen van:

1. A bal oldali menüben menj a **Settings** → **API** oldalra
2. Másold ki a következő adatokat:
   - **Project URL** (pl. `https://xyzabc123.supabase.co`)
   - **Project API keys** → **`anon` `public`** kulcs (hosszú string, kezdődik `eyJ...`)

---

## 3️⃣ Környezeti Változók Beállítása

Nyisd meg a `.env` fájlt és cseréld ki a placeholder-eket:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xyzabc123.supabase.co  # ← A te Project URL-ed
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...  # ← A te anon key-ed

# OpenWeather API Key
VITE_OPENWEATHER_API_KEY=your_openweather_key_here  # ← A te OpenWeather kulcsod
```

**FONTOS:** A `.env` fájl SOHA ne kerüljön fel GitHub-ra! (Már hozzáadva a `.gitignore`-hoz)

---

## 4️⃣ Adatbázis Séma Létrehozása

1. Supabase Dashboard-on menj a **SQL Editor** oldalra (bal oldali menü)
2. Kattints **"New query"**
3. Nyisd meg a `supabase_schema.sql` fájlt a projektben
4. Másold be a TELJES SQL kódot a Supabase SQL Editor-ba
5. Kattints **"Run"** (vagy Cmd/Ctrl + Enter)
6. ✅ Ellenőrizd, hogy a táblák létrejöttek: **Table Editor** → látszanak a `profiles`, `symptoms`, `entries` táblák

---

## 5️⃣ Authentication Beállítása

1. Menj a **Authentication** → **Providers** oldalra
2. **Email Auth** már be van kapcsolva alapból
3. **Email Templates** beállítás (opcionális):
   - **Confirm signup**: Ez az email megy ki regisztrációkor
   - **Magic Link**: Ez az email megy ki bejelentkezéskor

### Teszteléshez:
- **Settings** → **Authentication** → **Email Auth**
- Kapcsold ki a **"Confirm email"** opciót fejlesztés alatt
- Így azonnal be tudsz jelentkezni email megerősítés nélkül

---

## 6️⃣ Row Level Security (RLS) Ellenőrzés

Az adatbázis séma már beállította az RLS policy-ket, de ellenőrizd:

1. **Table Editor** → Válassz egy táblát (pl. `symptoms`)
2. Kattints az **RLS** gombra
3. Látszanak a policy-k:
   - "Users can view their own symptoms"
   - "Users can create their own symptoms"
   - stb.

Ez biztosítja, hogy mindenki csak a SAJÁT adatait látja!

---

## 7️⃣ Test User Létrehozása

1. **Authentication** → **Users** oldal
2. Kattints **"Add user"** → **"Create new user"**
3. Email: `test@example.com`
4. Password: Válassz egy jelszót
5. **Auto Confirm User**: ✅ BE (hogy azonnal be tudj jelentkezni)
6. Kattints **"Create user"**

---

## 8️⃣ Következő Lépések

Miután minden beállítva:

1. ✅ `.env` fájl kitöltve Supabase + OpenWeather kulcsokkal
2. ✅ SQL séma lefuttatva
3. ✅ Test user létrehozva

Akkor futtathatod a migrációs szkriptet ami áttölti a localStorage adatokat Supabase-be!

---

## 🔧 Hasznos Linkek

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase Docs**: https://supabase.com/docs
- **SQL Editor**: Bal menü → SQL Editor
- **Table Editor**: Bal menü → Table Editor
- **Auth Users**: Bal menü → Authentication → Users

---

## 🆘 Problémamegoldás

### "Invalid API key" hiba
- Ellenőrizd hogy jól másoltad be a kulcsokat
- NE a `service_role` kulcsot használd, hanem az `anon` kulcsot!

### SQL séma futtatás sikertelen
- Futtasd újra a teljes SQL kódot
- Ellenőrizd a hibaüzenetet az SQL Editor alján

### RLS policy hiba
- Bizonyosodj meg róla, hogy be vagy jelentkezve
- Ellenőrizd hogy a `user_id` megfelelően van beállítva

---

**Kész vagy? Szólj ha minden beállítva van, és folytatjuk az alkalmazás Supabase integrációjával!** 🚀
