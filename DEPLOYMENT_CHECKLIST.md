# Render Deployment Checklist ✅

## Pre-Deployment Checklist

### ✅ Code Ready
- [x] All files committed to GitHub
- [x] Repository: https://github.com/GaneshAdapnor/srs.git
- [x] render.yaml configured
- [x] Database config supports DATABASE_URL

## Deployment Steps

### Step 1: Create PostgreSQL Database
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "PostgreSQL"
- [ ] Name: `store-rating-db`
- [ ] Database: `store_rating_db`
- [ ] Plan: Free
- [ ] Region: Choose closest
- [ ] Click "Create Database"
- [ ] Wait 2 minutes
- [ ] **Copy Internal Database URL** (from Connections section)

### Step 2: Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub: `GaneshAdapnor/srs`
- [ ] Configure:
  - Name: `store-rating-system`
  - Region: Same as database
  - Branch: `main`
  - Root Directory: (empty)
  - Runtime: `Node`
  - Build Command: `npm run install-all && npm run build`
  - Start Command: `node backend/server.js`
  - Plan: Free

### Step 3: Set Environment Variables
Add these in the Environment section:

```
NODE_ENV=production
DB_TYPE=postgres
DATABASE_URL=<paste-internal-database-url-from-step-1>
JWT_SECRET=1424ed866103db3ae710f8d7d119ccec54b11d891914586a9141731b3cbaa36573cd8269a35c2b1f107237d932da9e12af2ac93c52a6ba945bbf294de67ad96b
JWT_EXPIRES_IN=24h
```

### Step 4: Deploy
- [ ] Click "Create Web Service"
- [ ] Watch build logs
- [ ] Wait for deployment (3-5 minutes)
- [ ] Note your app URL: `https://store-rating-system.onrender.com`

### Step 5: Seed Database
- [ ] Go to Web Service → "Shell" tab
- [ ] Run: `npm run seed`
- [ ] Wait for completion

## Post-Deployment Checklist

- [ ] Test app URL in browser
- [ ] Test login with demo accounts:
  - Admin: `admin@example.com` / `AdminPass123!`
  - Store Owner: `ganesh@store.com` / `StorePass123!`
  - User: `alice@example.com` / `UserPass123!`
- [ ] Verify database connection working
- [ ] Check all features working

## Your Generated JWT Secret
```
1424ed866103db3ae710f8d7d119ccec54b11d891914586a9141731b3cbaa36573cd8269a35c2b1f107237d932da9e12af2ac93c52a6ba945bbf294de67ad96b
```
Copy this and use it as your `JWT_SECRET` value.

## Troubleshooting

**Build fails?**
- Check build logs for errors
- Verify all dependencies in package.json

**Database connection fails?**
- Verify DATABASE_URL is Internal URL (not External)
- Check database is fully provisioned

**App won't start?**
- Verify start command: `node backend/server.js`
- Check environment variables are set correctly

## Need Help?
- Render Docs: https://render.com/docs
- Your deployment guide: See `QUICK_DEPLOY.md`

