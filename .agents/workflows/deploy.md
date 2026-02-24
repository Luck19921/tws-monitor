---
description: How to deploy the TWS Monitor app to Vercel
---

# Deployment Workflow: TWS Monitor → GitHub + Vercel

This guide walks through deploying the TWS Monitor Next.js application from local development to a publicly accessible URL via **Vercel** (the recommended platform for Next.js apps with dynamic API routes).

## Why Vercel (Not GitHub Pages)?

| Feature | GitHub Pages | Vercel |
|---------|-------------|--------|
| Static HTML | ✅ | ✅ |
| Dynamic API Routes | ❌ | ✅ |
| Server-Side Rendering | ❌ | ✅ |
| Edge Functions | ❌ | ✅ |
| Next.js Native | ❌ | ✅ |

Since our app uses **dynamic API routes** (`/api/stocks/[symbol]`, Yahoo Finance, TWSE), **Vercel is the only viable option**.

---

## Step 1: Push to GitHub

### 1.1 Create a GitHub Repository
// turbo
1. Go to [github.com/new](https://github.com/new)
2. Name it `tws-monitor` (or your preferred name)
3. Set to **Public** or **Private**
4. **Do NOT** initialize with README (we'll push our existing code)
5. Click **Create repository**

### 1.2 Push Local Code
// turbo-all
```bash
cd /home/albert/Documents/Antigravity
git remote add origin https://github.com/<YOUR_USERNAME>/tws-monitor.git
git branch -M main
git push -u origin main
```

> **Note**: If you haven't configured git credentials, you'll need a [Personal Access Token](https://github.com/settings/tokens) or use `gh auth login`.

### 1.3 Verify .gitignore
Our `.gitignore` already excludes:
- `node_modules/` — dependencies (850MB+)
- `.env*` — API keys and secrets
- `.next/` — build output
- `prisma/dev.db` — local SQLite database

---

## Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
// turbo
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `tws-monitor` repository
4. Vercel auto-detects Next.js — press **Deploy**

### 2.2 Set Environment Variables
In Vercel Dashboard → **Settings** → **Environment Variables**, add:

| Key | Value | Required? |
|-----|-------|-----------|
| `DATABASE_URL` | `file:./dev.db` | ✅ (Prisma) |

> **Important**: Our app currently uses **SQLite** for WatchLists. Vercel's serverless functions have **no persistent filesystem**, so WatchList data won't persist between cold starts. For production persistence, migrate to a cloud database (e.g., Vercel Postgres, PlanetScale, or Neon).

### 2.3 Prisma Setup for Vercel
Add a `postinstall` script to `package.json` so Prisma generates its client during Vercel builds:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## Step 3: Verify Deployment

After Vercel deploys, check:
1. **Homepage** loads with SmartSearch
2. **Search** for `2330` → redirects to stock detail page
3. **K-line chart** renders with Yahoo Finance data
4. **Header price** matches K-line's last candle
5. **API routes** return JSON: `https://your-app.vercel.app/api/stocks/2330`

---

## Step 4: Custom Domain (Optional)

1. In Vercel Dashboard → **Domains**
2. Add your domain (e.g., `stocks.yourdomain.com`)
3. Update DNS records as instructed by Vercel
