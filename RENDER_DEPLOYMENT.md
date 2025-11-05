# Deploying to Render - Step by Step Guide

## Prerequisites
1. GitHub account with your code pushed to a repository
2. Render account (sign up at https://render.com - free tier available)

## Option 1: Using Render Dashboard (Recommended for First Time)

### Step 1: Create PostgreSQL Database
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `store-rating-db` (or any name you prefer)
   - **Database**: `store_rating_db`
   - **User**: `store_rating_user` (or leave default)
   - **Region**: Choose closest to your users
   - **Plan**: Free (for testing)
4. Click **"Create Database"**
5. Wait for database to be provisioned (~2 minutes)
6. **IMPORTANT**: Copy the **Internal Database URL** (you'll need this later)

### Step 2: Create Web Service
1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect GitHub"** if not connected
   - Select your repository
   - Click **"Connect"**
3. Configure the service:
   - **Name**: `store-rating-system` (or any name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root of repo)
   - **Runtime**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Free

### Step 3: Set Environment Variables
In the Web Service settings, go to **"Environment"** section and add:

**Option A: Using DATABASE_URL (Recommended - Easier)**
```
NODE_ENV=production
DB_TYPE=postgres
DATABASE_URL=<your-internal-database-url>
JWT_SECRET=<generate-a-strong-random-secret-here>
JWT_EXPIRES_IN=24h
```

**Option B: Using Individual Database Parameters**
```
NODE_ENV=production
DB_TYPE=postgres
DB_NAME=store_rating_db
DB_USER=store_rating_user
DB_HOST=<your-database-host-from-internal-url>
DB_PORT=5432
DB_PASSWORD=<your-database-password-from-internal-url>
JWT_SECRET=<generate-a-strong-random-secret-here>
JWT_EXPIRES_IN=24h
```

**To get DATABASE_URL:**
1. Go to your PostgreSQL database in Render
2. In the **"Connections"** section, find **"Internal Database URL"**
3. Copy the entire URL (it looks like: `postgresql://user:password@hostname:5432/database`)
4. Paste it as `DATABASE_URL` value

**Note:** The app now automatically supports `DATABASE_URL` - this is the easiest option!

**Generate JWT_SECRET:**
Run this command locally to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build the frontend
   - Start the server
3. Watch the build logs for any errors
4. Once deployed, your app will be available at: `https://your-service-name.onrender.com`

### Step 5: Seed the Database (Optional)
After first deployment, you may want to seed the database with demo data:

1. In Render Dashboard, go to your Web Service
2. Click on **"Shell"** tab
3. Run:
   ```bash
   npm run seed
   ```

## Option 2: Using render.yaml (Infrastructure as Code)

If you prefer to define everything in code:

1. The `render.yaml` file is already created in your project root
2. In Render Dashboard:
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Review the configuration and click **"Apply"**
3. You'll still need to set the database connection details manually in environment variables

## Important Notes

### Database Connection
- **Always use Internal Database URL** for production (not External URL)
- Internal URL ensures secure connection within Render's network
- External URL is only for connecting from outside Render

### Build Process
- The build command installs dependencies for both root and frontend
- Then builds the React frontend
- The built files are served by Express

### Port Configuration
- Render automatically sets `PORT` environment variable
- Your app reads from `process.env.PORT` (already configured)
- No need to hardcode port numbers

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Database has 90-day retention limit on free tier
- Upgrade to paid plan for always-on service

### Troubleshooting

**Build fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Render uses latest LTS)

**Database connection fails:**
- Verify you're using Internal Database URL
- Check environment variables are set correctly
- Ensure database is fully provisioned

**App won't start:**
- Check start command is correct: `node backend/server.js`
- Verify PORT environment variable is set
- Check server logs for errors

## Post-Deployment

### Set up Custom Domain (Optional)
1. Go to your Web Service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Follow DNS configuration instructions

### Monitor Your App
- View logs in real-time in Render dashboard
- Set up alerts for service downtime
- Monitor database usage

## Security Checklist
- [ ] Strong JWT_SECRET set (not default)
- [ ] NODE_ENV set to production
- [ ] Database uses Internal URL only
- [ ] CORS configured for your domain (if needed)
- [ ] Rate limiting enabled (already in code)

## Demo Accounts (After Seeding)
- **Admin**: `admin@example.com` / `AdminPass123!`
- **Store Owner**: `ganesh@store.com` / `StorePass123!`
- **User**: `alice@example.com` / `UserPass123!`

---

**Need Help?**
- Render Docs: https://render.com/docs
- Render Support: support@render.com

