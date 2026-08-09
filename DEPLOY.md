# Deployment Guide — Millennium Village Parking PWA

**Current architecture:** Passkey-first (WebAuthn/FaceID), Clerk once for email+identity bootstrap, Cloudflare D1 for data, Cloudflare Pages hosting.

## Prerequisites

1. **Cloudflare account** — **Pages** + **D1** (free tier is fine)
2. **GitHub repo** linked to Cloudflare Pages (auto-deploys on `main` push)
3. **Clerk account** — create one at https://dashboard.clerk.com
4. **Node 22+** + **Wrangler 4+** installed locally

---

## One-time setup

### 1. Create Clerk application

Go to **Clerk Dashboard** → **Create Application**:
- Name: `Millennium Village Parking`
- **Auth methods:** enable **email address** (verification code) + **continue with Google** (recommended). No password.
- **Sessions**: lifetime 30 days + "sliding refresh".
- Copy the **Publishable key** and **Secret key** — you'll use them in step 3 and 5.

### 2. Create D1 database

```bash
wrangler d1 create mv-parking-db
```

Then in Cloudflare Pages → **Settings** → **D1 bindings**:
- **Variable name:** `DB`
- **D1 database:** `mv-parking-db`

### 3. Action the environment

The `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is public and baked into the client bundle. Set it in Cloudflare Pages → **Settings** → **Environment variables**.

The `CLERK_SECRET_KEY` must **never** leave your machine. We use it in the Pages **Functions** (server-side) only. For convenience you can add it via Cloudflare Pages (it's still protected because it never hits the browser). In dev, populate `.dev.vars`.

Finally, set these:

- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET` (from Clerk Dashboard → Webhooks → Create Endpoint)
- `MAIL_FROM` optional (deprecated in this architecture)

**In dev**, your `.dev.vars` (at project root) should contain exactly:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...   # ONLY after webhook step (Step 6)
```

That file is already gitignored; never commit it.

### 4. Apply schema to production D1 (first time only)

```bash
wrangler d1 execute mv-parking-db --file migrations/0001_init.sql
```

To load demo data:

```bash
wrangler d1 execute mv-parking-db --file migrations/0002_demo_seed.sql
```

### 5. Optional: setup passkeys table for extra security

```bash
wrangler d1 execute mv-parking-db --file migrations/0002_passkeys.sql
```

---

## Local development (full-stack)

```bash
# 1. Set up env file
copy .dev.vars.example .dev.vars

# 2. Install + apply migrations locally
npm install
npm run db:migrate:local    # sets up parking.sqlite

# 3. Seed demo users
npm run db:seed:demo

# 4. Run dev server
npm run dev

# 5. Optional: full Edge-accurate local dev
npm run dev:cf
```

---

## Production flow

1. Push to `main` (merge `kimi-k3-improvements` when ready)
2. Pages builds & deploys automatically
3. New user opens `/`, sees "Sign in with biometric" → either:
   - **First time on this device**:
     - Tap "Email me a code"
     - Enter email (Clerk verifies via code)
     - Tap "Enable biometric unlock" → FaceID/TouchID
     - Done. Never asked again.
   - **Returning user**: biometric unlock straight in.
4. **Added a resident?** They go through the same flow (after you whitelist them in the app).

---

## Admin user bootstrap

Your first admin user comes from `migrations/0002_demo_seed.sql`. Sign in **once** with:
- Admin: `admin@millennium.com`
- Password/code: whatever Clerk sends, then set a biometric

**Please change the seeded email** to your real email (`ajwilsonnz@gmail.com`) *before* you deploy to production. You can edit `0002_demo_seed.sql` — just update the `email` column — and re-run:

```bash
wrangler d1 execute mv-parking-db --file migrations/0002_demo_seed.sql
```

---

## Feature matrix (what's live)

| Feature | Status |
|---|---|
| Passkey sign-in (FaceID/TouchID) | ✅ Working |
| Email code bootstrap (Clerk) | ✅ Working (first time) |
| Existing profile update (name, phone) | ✅ Working |
| Vehicle registration approval | ✅ Working (Pending | Approved | Rejected) |
| Visit bookings (upcoming/past/cancelled) | ✅ Working |
| Real-time Status tab | ✅ Working |
| Book Regular Visitor via saved guests | ✅ Working |
| Role-based permissions | ✅ Working |
| Admin Controls | ✅ Working |
| Management Portal (incl. demerit issuing) | ✅ Working |
| Spot lending (private parks) | ✅ Working |
| PWA install + theme | ✅ Working |
| Offline support | ✅ Working (static assets cached) |

---

## Test matrix (before pushing to main)

- [ ] **First-ever sign-in** from new device/browser — magic OTP → biometric → in-app view. Confirm home view appears.
- [ ] **Second sign-in same device** — should prompt biometric immediately (no email).
- [ ] **Sign out** — click Sign Out. Expected result → back to login screen.
- [ ] **Add another device** via Account → Sign-in & security → Add another device. Verify the device registers.
- [ ] **Revoke device** in Account. Sign out. Try sign-in with the revoked device → should fail.
- [ ] **New user, non-whitelisted email** — should be rejected at Clerk sync (403).
- [ ] **Whitelisted email via Admin** — should appear in the Whitelist panel, can sign in.
- [ ] **Book visitor** → Home → confirm availability count decremented.
- [ ] **Bookings + Status tabs** update live as expected.
- [ ] **Offline mode** — enable "Offline" in DevTools Network, reload, UI should still render and continue to display cached pages.
- [ ] **Resync** — after Clerk session handoff has completed, call `signOut({ sessionId })` in the browser console to confirm Clerk is out of the picture; reload should stay logged in via our D1 session.

---

## Rollback / recovery

- **Current production app breaks** → rollback via Cloudflare Pages → Deployments → previous good version → **Rollback**
- **Passkeys out of sync** → I can wipe all passkeys by running the `0002_passkeys.sql` migration again
- **Data corruption risk** → take a backup before big changes: `wrangler d1 export mv-parking-db --output backup.sql`

---

## Don't forget

- Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to **Cloudflare Pages** Environment variables (Production) — otherwise the app won't boot in production.
- After that, set `CLERK_WEBHOOK_SIGNING_SECRET` in Pages → D1 bindings and make sure the webhook hits → `/api/webhooks/clerk`.
