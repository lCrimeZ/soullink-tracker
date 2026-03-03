# SoulLink Tracker (Live) – FireRed Template (2 Spieler + Admin-PW)

## Was das kann
- Public **read-only** Run-Seite: `/run/<slug>`
- Admin-Login per Passwort: `/admin`
- Admin erstellt seeded FireRed-Run: `/admin/create-run`
- Admin kann Encounters bearbeiten (Pokémon, Typen, Status, Team-Slot)

## Supabase Setup (1x Copy/Paste)
1. Supabase → neues Projekt erstellen
2. **SQL Editor** → `supabase.sql` ausführen
3. Settings → API kopieren:
   - `Project URL`
   - `anon public key`
   - `service_role key` (nur für Vercel env!)

## Vercel Deploy (klick-klick)
1. Dieses Projekt zu GitHub hochladen
2. Vercel → New Project → Repo importieren
3. Env Vars in Vercel setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `ADMIN_COOKIE_SECRET` (z.B. `BXBmYttPo9e3Ga70mow4OEdCiYzog2x1`)

## Nutzung
- `/admin` einloggen
- `/admin/create-run` Run erstellen
- `/run/<slug>` Link an Freundin schicken (sie kann schauen, du kannst editieren)
