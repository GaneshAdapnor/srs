# Store Rating System - Full Stack Web Application

A comprehensive full-stack web application for managing stores and user ratings with role-based authentication.

## Tech Stack

- **Backend**: Express.js (Node.js)
- **Database**: SQLite (development) / PostgreSQL (production) with Sequelize ORM
- **Frontend**: React.js with TypeScript and Custom CSS
- **Authentication**: JWT-based authentication
- **Validation**: Express-validator for backend, custom validation for frontend

## Features

### System Administrator
- Dashboard with system statistics (total users, stores, ratings)
- Manage stores with filtering, sorting, and pagination
- Manage users with role-based filtering
- Create new users and stores
- View detailed user information including ratings for store owners

### Normal User
- Sign up with validation (name: 20-60 chars, address: max 400 chars, password: 8-16 chars with uppercase and special char)
- Browse and search stores by name or address
- Rate stores (1-5 stars) with optional comments
- Update existing ratings
- View store details and other users' ratings

### Store Owner
- Dashboard showing store statistics and recent ratings
- View all ratings for their stores
- See average ratings and total rating counts
- Access to detailed rating information

## Database Schema

### Users Table
- id (Primary Key)
- name (20-60 characters)
- email (unique, valid email format)
- address (max 400 characters)
- password (encrypted with bcrypt)
- role (admin, user, store_owner)
- isActive (boolean)
- timestamps

### Stores Table
- id (Primary Key)
- name (1-100 characters)
- email (unique, valid email format)
- address (max 400 characters)
- ownerId (Foreign Key to Users)
- isActive (boolean)
- timestamps

### Ratings Table
- id (Primary Key)
- userId (Foreign Key to Users)
- storeId (Foreign Key to Stores)
- rating (1-5 integer)
- comment (optional text)
- timestamps
- Unique constraint on (userId, storeId)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- SQLite (included with Node.js) or PostgreSQL (v12 or higher) for production
- npm or yarn

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (optional):
   Create a `.env` file in the root directory for custom configuration:
   ```env
   # Database Configuration (SQLite by default)
   DB_TYPE=sqlite
   # For PostgreSQL production:
   # DB_NAME=store_rating_db
   # DB_USER=postgres
   # DB_PASSWORD=your_password
   # DB_HOST=localhost
   # DB_PORT=5432

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=24h

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

3. **Populate the database with demo data**:
   ```bash
   npm run seed
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

### Quick Start

The application is designed to run with a single command:

```bash
# Install all dependencies
npm run install-all

# Setup database (first time only)
npm run setup-db
npm run seed

# Start the application (builds frontend and starts server)
npm run dev

# Access the application
# http://localhost:5000
```

The application will:
- Build the React frontend
- Start the Express server
- Serve the frontend from the backend
- Use SQLite database (no setup required)
- Include comprehensive demo data

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `PUT /api/auth/password` - Update password
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout

### Admin Routes (Admin only)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/stores` - List all stores with filtering
- `GET /api/admin/users` - List all users with filtering
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/stores` - Create new store
- `POST /api/admin/users` - Create new user

### User Routes (Authenticated users)
- `GET /api/user/stores` - List stores with search
- `GET /api/user/stores/:id` - Get store details
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Store Owner Routes (Store owners only)
- `GET /api/store/dashboard` - Store owner dashboard
- `GET /api/store/my-stores` - Get owner's stores
- `GET /api/store/stores/:id/ratings` - Get store ratings

### Rating Routes (Authenticated users)
- `POST /api/rating` - Submit/update rating
- `GET /api/rating/my-ratings` - Get user's ratings
- `GET /api/rating/store/:storeId` - Get rating for specific store
- `DELETE /api/rating/:id` - Delete rating

## Validation Rules

### User Registration/Update
- **Name**: 20-60 characters
- **Email**: Valid email format
- **Address**: Maximum 400 characters
- **Password**: 8-16 characters, must include at least 1 uppercase letter and 1 special character

### Store Creation
- **Name**: 1-100 characters
- **Email**: Valid email format
- **Address**: Maximum 400 characters

### Rating
- **Rating**: Integer between 1-5
- **Comment**: Optional text

## Security Features

- JWT-based authentication
- Password encryption with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Store.js
│   │   ├── Rating.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── user.js
│   │   ├── store.js
│   │   └── rating.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── user/
│   │   │   ├── store-owner/
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── tailwind.config.js
│   └── package.json
├── package.json
└── README.md
```

## Demo Dataset

The application comes with a comprehensive dataset including:

### Users (13 total)
- **1 System Administrator**: `admin@example.com` / `AdminPass123!`
- **4 Store Owners**: 
  - Ganesh Adapnor (`ganesh@store.com`)
  - Sarah Wilson (`sarah@store.com`) 
  - Michael Chen (`michael@store.com`)
  - Emily Rodriguez (`emily@store.com`)
- **8 Normal Users**: Alice, Bob, Carol, David, Eva, Frank, Grace, Henry

### Stores (10 total)
- **Ganesh's Stores (3)**: Tech Gadgets Hub, Coffee Corner Express, Electronics World
- **Sarah's Stores (2)**: Fashion Forward, Beauty Boutique
- **Michael's Stores (2)**: Fresh Market Grocery, Sports Zone
- **Emily's Stores (3)**: Book Nook, Home Decor Plus, Garden Center

### Ratings (33+ ratings)
- Multiple ratings per store with realistic comments
- Ratings range from 3-5 stars
- Detailed feedback from different users

## Testing the Application

1. **Start the application**: `npm run dev`
2. **Access the app**: http://localhost:5000
3. **Login with demo accounts**:
   - **Admin**: `admin@example.com` / `AdminPass123!`
   - **Store Owner**: `ganesh@store.com` / `StorePass123!`
   - **Normal User**: `alice@example.com` / `UserPass123!`
4. **Test all features** with the comprehensive dataset

## Production Deployment

1. Set `NODE_ENV=production` in your environment variables
2. Use a production PostgreSQL database
3. Set a strong JWT secret
4. Build the frontend: `cd frontend && npm run build`
5. Serve the built files with your backend or a static file server
6. Configure proper CORS settings for your domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
#   s r s  
 #   s r s  
 