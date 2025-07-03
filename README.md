# Nutri Online API

A comprehensive nutrition API built with TypeScript, Fastify, TypeORM, and PostgreSQL.

## Features

- **User Authentication**: Sign up/Sign in with Argon2 password hashing
- **User Management**: Complete user profile management with body measurements and activity tracking
- **Meal Management**: Full CRUD operations for meal items and user meal selections
- **Database Relations**: Well-structured database with proper relationships
- **Security**: JWT authentication, rate limiting, CORS, and helmet protection

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nutri-online-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and JWT secret.

4. **Database Setup**:
   Make sure PostgreSQL is running and create the database:
   ```sql
   CREATE DATABASE nutri_online;
   ```

5. **Run the application**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in existing user

### User Management
- `GET /api/users/profile` - Get user profile (requires auth)
- `POST /api/users/body-measurements` - Create body measurements (requires auth)
- `PUT /api/users/body-measurements` - Update body measurements (requires auth)
- `POST /api/users/activity` - Create user activity (requires auth)
- `PUT /api/users/activity` - Update user activity (requires auth)

### Meal Management
- `GET /api/meals/{mealType}/items` - Get meal items (breakfast, morning-snack, lunch, afternoon-snack, dinner)
- `POST /api/meals/{mealType}/items` - Create meal item (requires auth)
- `PUT /api/meals/{mealType}/items/{id}` - Update meal item (requires auth)
- `DELETE /api/meals/{mealType}/items/{id}` - Delete meal item (requires auth)
- `GET /api/meals/{mealType}/selections` - Get user meal selections (requires auth)
- `POST /api/meals/{mealType}/selections` - Create user meal selection (requires auth)
- `DELETE /api/meals/{mealType}/selections/{id}` - Delete user meal selection (requires auth)

### Health Check
- `GET /health` - API health status

## Database Schema

The API includes the following entities:
- Users (with authentication)
- Body Measurements (weight, height, age, goals, etc.)
- User Activity (activity level, workout plan)
- Meal Items (breakfast, snacks, lunch, dinner)
- User Meal Selections (user's meal choices)

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run typeorm` - Run TypeORM CLI commands
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: nutri_online)
- `JWT_SECRET` - JWT secret key (minimum 32 characters)
- `NODE_ENV` - Environment (development/production)

## Security Features

- Argon2 password hashing
- JWT authentication
- Rate limiting (100 requests per minute)
- CORS protection
- Helmet security headers
- Input validation with Zod

## Data Validation

All endpoints use Zod schemas for input validation, ensuring data integrity and proper error handling.