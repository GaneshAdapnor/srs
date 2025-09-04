# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- SQLite (included with Node.js) or PostgreSQL (v12 or higher) for production

## Super Quick Start (Recommended)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Setup Database (First Time Only)
```bash
npm run setup-db
npm run seed
```

### 3. Start the Application
```bash
npm run dev
```

### 4. Access the Application
Open your browser and go to: **http://localhost:5000**

That's it! The application will:
- Use SQLite database (no setup required)
- Preserve your data between server restarts
- Include comprehensive demo data
- Serve both frontend and backend on port 5000

## Demo Accounts

The application comes with a rich dataset:

### System Administrator
- **Email**: `admin@example.com`
- **Password**: `AdminPass123!`

### Store Owners
- **Ganesh Adapnor**: `ganesh@store.com` / `StorePass123!`
- **Sarah Wilson**: `sarah@store.com` / `StorePass123!`
- **Michael Chen**: `michael@store.com` / `StorePass123!`
- **Emily Rodriguez**: `emily@store.com` / `StorePass123!`

### Normal Users
- **Alice Johnson**: `alice@example.com` / `UserPass123!`
- **Bob Smith**: `bob@example.com` / `UserPass123!`
- **Carol Davis**: `carol@example.com` / `UserPass123!`
- **David Brown**: `david@example.com` / `UserPass123!`
- **Eva Martinez**: `eva@example.com` / `UserPass123!`
- **Frank Wilson**: `frank@example.com` / `UserPass123!`
- **Grace Lee**: `grace@example.com` / `UserPass123!`
- **Henry Taylor**: `henry@example.com` / `UserPass123!`

## Dataset Overview

- **13 Users** (1 Admin, 4 Store Owners, 8 Normal Users)
- **10 Stores** across different categories (Tech, Fashion, Grocery, Sports, Books, etc.)
- **33+ Ratings** with realistic comments and feedback

## Testing the Application

1. **Login as Admin** (`admin@example.com` / `AdminPass123!`)
   - View dashboard with comprehensive statistics (13 users, 10 stores, 33+ ratings)
   - Manage all users and stores with search and filtering
   - Create new users and stores

2. **Login as Store Owner** (`ganesh@store.com` / `StorePass123!`)
   - View dashboard with 3 stores (Tech Gadgets Hub, Coffee Corner Express, Electronics World)
   - See ratings and feedback from multiple users
   - View average ratings and user details

3. **Login as Normal User** (`alice@example.com` / `UserPass123!`)
   - Browse all 10 stores with search functionality
   - Rate stores with detailed comments
   - Update profile and password

## Troubleshooting

### Database Issues
- **SQLite**: No setup required, works out of the box
- **PostgreSQL**: Ensure service is running and credentials are correct

### Port Conflicts
- The app serves both frontend and backend on port 5000
- Change `PORT` in `.env` file if 5000 is occupied

### Build Issues
- Clear dependencies: `rm -rf node_modules && npm run install-all`
- Check Node.js version: `node --version` (should be v14+)

## Features Implemented

✅ **System Administrator**
- Dashboard with statistics
- Store management with filtering/sorting
- User management with role filtering
- Create new users and stores
- View detailed user information

✅ **Normal User**
- User registration with validation
- Store browsing with search
- Rating system (1-5 stars)
- Update ratings
- Profile management

✅ **Store Owner**
- Dashboard with store statistics
- View ratings for their stores
- Average rating calculations

✅ **Security & Validation**
- JWT authentication
- Password encryption (bcrypt)
- Role-based access control
- Input validation
- Rate limiting
- CORS protection

✅ **Database**
- PostgreSQL with Sequelize ORM
- Proper relationships and constraints
- Data validation at model level

✅ **Frontend**
- React with TypeScript
- TailwindCSS for styling
- Responsive design
- Role-based routing
- Error handling
