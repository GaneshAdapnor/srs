# Quick Deploy to Render - Step by Step

## 🚀 Fast Track Deployment (5 minutes)

### Step 1: Sign Up / Login to Render
1. Go to https://render.com
2. Sign up or log in (you can use GitHub to sign in)

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - **Name**: `store-rating-db`
   - **Database**: `store_rating_db`
   - **Plan**: Free
   - **Region**: Choose closest to you
3. Click **"Create Database"**
4. Wait 2 minutes for provisioning
5. **Copy the Internal Database URL** (in "Connections" section)
   - Looks like: `postgresql://user:password@hostname:5432/database`

### Step 3: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub:
   - Click **"Connect GitHub"**
   - Select repository: **`GaneshAdapnor/srs`**
   - Click **"Connect"**
3. Configure:
   - **Name**: `store-rating-system`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Runtime**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Free

### Step 4: Set Environment Variables
In the **Environment** section, add these variables:

```
NODE_ENV=production
DB_TYPE=postgres
DATABASE_URL=<paste-your-internal-database-url-here>
JWT_SECRET=<generate-secret-below>
JWT_EXPIRES_IN=24h
```

**Generate JWT_SECRET:**
Run this locally:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste as `JWT_SECRET` value.

### Step 5: Deploy!
1. Click **"Create Web Service"**
2. Watch the build logs
3. Wait 3-5 minutes for deployment
4. Your app will be live at: `https://store-rating-system.onrender.com`

### Step 6: Seed Database (Optional)
After first deployment:
1. Go to your Web Service
2. Click **"Shell"** tab
3. Run: `npm run seed`
4. This adds demo users and stores

## ✅ Done!

Your app is now live! Access it at your Render URL.

**Demo Accounts** (after seeding):
- Admin: `admin@example.com` / `AdminPass123!`
- Store Owner: `ganesh@store.com` / `StorePass123!`
- User: `alice@example.com` / `UserPass123!`

## 🔧 Troubleshooting

**Build fails?**
- Check build logs for errors
- Ensure all dependencies are in package.json

**Database connection fails?**
- Verify DATABASE_URL is correct (Internal URL, not External)
- Check database is fully provisioned

**App won't start?**
- Check start command: `node backend/server.js`
- Verify PORT environment variable is set (Render sets this automatically)

## 📝 Notes

- Free tier services spin down after 15 min inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid plan for always-on service

