# Deployment Guide — Millennium Village Parking PWA

## Prerequisites

1. **Cloudflare account** with **Pages** and **D1** (free tier is fine)
2. **GitHub repo** connected to Cloudflare Pages (auto-deploys on push to `main`)
3. **Sender email** verified in Cloudflare (for magic-link delivery)
4. **Node 22+** and **Wrangler 4** installed locally (for migrate/seed/backup commands)

---

## One-time setup

### 1. Create D1 database

```bash
wrangler d1 create mv-parking-db
```

Note the `database_id`. Add it to **Pages → Settings → D1 bindings**:
- **Variable name:** `DB`
- **D1 database:** `mv-parking-db`

### 2. Verify the sender email

Go to **Cloudflare Dashboard → Email → Email Sending → Sender Addresses**:
- Add `ajwilsonnz@gmail.com`
- Verify via the confirmation email
- This authorizes the magic-link "from:" address

### 3. Cloudflare Pages project settings

- **Build command:** `npm run build`
- **Build output directory:** `.vercel/output/static`
- **Environment variables (Production):**
  - `MAIL_FROM` = `Millennium Village Parking <ajwilsonnz@gmail.com>`
  - (optional) `MAIL_FROM_NAME` = `Millennium Village Parking`

No other env vars needed. D1 is auto-bound via the Pages Integration.

### 4. Apply schema to production D1

```bash
wrangler d1 execute mv-parking-db --file migrations/0001_init.sql
```

To load demo data for testing the first sign-in flow:

```bash
wrangler d1 execute mv-parking-db --file migrations/0002_demo_seed.sql
```

To clear demo data (keeps users/admin, wipes sessions/vehicles):

```bash
wrangler d1 execute mv-parking-db --file migrations/0099_reset_demo.sql
```

---

## Local development (full-stack)

```bash
npm run db:migrate:local        # Apply migrations to local parking.sqlite
npm run db:seed:demo            # Seed demo users/vehicles/sessions
npm run dev                      # Standard Next.js dev (UI-only, mock state not used)

# Full-stack local dev (real D1 via Wrangler Pages + local D1)
npm run dev:cf
```

**Demo mode:** visit `http://localhost:3000/?demo=1` to bypass login and use mock state (Adam Miller / Sarah Jenkins / BodyCorp Admin) for quick UI iterations without needing the mail sender.

---

## Production flow

1. Push to `main` (or merge `kimi-k3-improvements` into `main`)
2. Cloudflare Pages builds + deploys automatically
3. User opens the app → login screen
4. Admin adds a resident via **Account → Admin Controls** (whitelists email)
5. Resident signs in via magic link (6-digit code)
6. Admin assigns vehicles + units in **Account → Management Portal** (for BodyCorp)
7. Residents can book visitors, manage their vehicles, and book their unit's private car park for neighbours

---

## First admin user (one-time bootstrap)

After `0001_init.sql` and `0002_demo_seed.sql`:
- Admin email: `admin@millennium.com` (change this in the seed to your real email before production)
- Log in once with any code printed to console (or email via verified sender)
- After login, edit the whitelist row in Cloudflare Dashboard → D1 → Data to change the name/email to yours

---

## Backup / restore

**Export:**
```bash
wrangler d1 export mv-parking-db --output backup-$(date +%Y%m%d).sql
```

**Import (into a new DB):**
```bash
wrangler d1 execute mv-parking-db --file backup-20250101.sql
```

---

## Rollback plan

Push `kimi-k3-improvements` → `main` rollout goes wrong:
1. In Cloudflare Pages → **Deployments**, click the previous working deployment → **Rollback to this deployment**
2. The GitHub history is unchanged; fix forward with a new commit.

---

## Feature matrix (what's live after this branch)

| Feature | Status | Where |
|---|---|---|
| Visitor booking | ✅ Working | Home → Hero card |
| Saved regular visitors | ✅ Working | Home → Quick actions → Book Regular Visitor |
| Vehicle verification (Status tab) | ✅ Working | Status tab |
| Free-text/camera plate entry | ✅ Working (text) | BookingModal |
| Account view (vehicles, saved visitors, demerits, notifications, PWA install) | ✅ Working | Account tab |
| Magic-link auth | ✅ Working | LoginView + `/api/auth/*` |
| Whitelist invite (admin) | ✅ Working | Account → Admin Controls |
| Role-based access (user / management / admin) | ✅ Working | Auth guards on `/api/mgmt/*` + `/api/admin/*` + UI |
| Vehicle approval workflow | ✅ Working | Management → Vehicles tab |
| Demerit issuance | ✅ Working | Management → Demerits tab |
| Boot request (notify resident to vacate) | ✅ Working | Management → Active sessions tab |
| Lend my spot (resident spot rental) | 🟡 UI only — no DB-backed listing yet | Account → Make personal carpark available |
| PWA install | ✅ Working | Home → Install card / Account → Install |
| Theme (light/dark/system) | ✅ Working | Account → Preferences |
| Occupancy statistics | ✅ Working | Home → hero card |

---

## Test matrix (run before pushing to main)

- [ ] `localhost:3000/?demo=1` shows a demo banner and lets you ride Adam Miller as user / management / admin
- [ ] `localhost:3000` (non-demo) shows the Login overlay
- [ ] Send yourself the magic link from a real email
- [ ] While logged in, book a visitor and verify it appears in Status after a few seconds
- [ ] Try the **Book Regular Visitor** saved-guest picker
- [ ] Admin: add a new email to the whitelist via Account → Admin Controls → Whitelist
- [ ] Management: issue a demerit via Account → Management Portal → Demerits
- [ ] In Cloudflare Dashboard → D1, confirm tables contain real data (users, sessions, whitelist)
- [ ] Install the PWA on a mobile device and confirm notifications flow
