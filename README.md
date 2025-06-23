# SmartBrain

A full-stack web application that detects faces in images using AI. Built with React, TypeScript, and Express. 

## Overview

SmartBrain is a modern web application that allows users to submit image URLs and detect faces using the Clarifai API. The application features user authentication, request tracking, and a beautiful UI built with React and Tailwind CSS.

## Features

- User registration and authentication
- Face detection in images using Clarifai API
- Request tracking and limiting
- Responsive design with Tailwind CSS
- PostgreSQL database with Prisma ORM

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS v4
- Vite
- tsParticles for background effects
- React Parallax Tilt

### Backend
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- bcrypt for password hashing
- Clarifai API for face detection

## Project Structure

```
smartbrain/
├── frontend/             # React frontend application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/              # Express backend server
│   ├── server/           # Server code
│   ├── prisma/           # Prisma schema and migrations
│   └── package.json      # Backend dependencies
├── .env                  # Environment variables
└── package.json          # Root package.json for workspaces
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Fortfel/SmartBrain.git
   cd SmartBrain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your environment variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
   CLARIFAI_PAT="your-clarifai-pat"
   CLARIFAI_USER_ID="your-clarifai-user-id"
   CLARIFAI_APP_ID="SmartBrain"
   ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173,http://localhost:4173,your-frontend-url
   # localhost or your backend url
   VITE_API_URL=http://localhost:3000/smartbrain-api
   VITE_MAX_API_REQUESTS_PER_MONTH=20
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

### Development

Start the development server:

```bash
npm run dev
```

This will start both the frontend and backend servers concurrently.

### Building for Production

Build the application for production:

```bash
npm run build
```

### Running in Production

Start the production server:

```bash
npm run start:backend
npm run start:frontend
```

## Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

1. Build the frontend:
   ```bash
   npm run build:frontend
   ```

2. Deploy the contents of the `dist` directory to your hosting provider.

### Backend Deployment

#### Standard Deployment

1. Build the backend:
   ```bash
   npm run build:backend
   ```

2. Deploy the contents of the `dist/backend` directory to your server.

3. Set up environment variables on your server.

4. Start the server:
   ```bash
   node dist/backend/server/server.js
   ```

#### Shared Hosting Deployment (cPanel)

When deploying to shared hosting environments like cPanel, there are special considerations for Prisma:

1. **Important: Prisma Client Generation**
   - Shared hosting environments may have issues with building the Prisma client
   - Generate the Prisma client locally before deployment:
     ```bash
     npm run prisma:generate
     ```
   - Upload both the `node_modules/.prisma` directory and the `node_modules/@prisma` directory to your server
   - This ensures the Prisma client is already built and doesn't need to be generated on the server

2. **Database Migrations**
   - You cannot run `prisma migrate` commands directly on shared hosting
   - Instead, extract the SQL from your migrations:
     ```bash
     npx prisma migrate diff --from-empty --to-schema-datamodel backend/prisma/schema.prisma --script > migration.sql
     ```
   - Run this SQL manually through phpPgAdmin or another database management tool

3. **PostgreSQL User Permissions**
   - Ensure your PostgreSQL user has the necessary permissions:
     - `CREATE`, `ALTER`, `DROP` on tables, sequences, and functions
     - `INSERT`, `SELECT`, `UPDATE`, `DELETE` on all tables
     - Example SQL to grant permissions:
       ```sql
       -- Replace 'your_database_name' and 'your_username' with actual valuesme;
       GRANT CONNECT ON DATABASE your_database_name TO your_username;
       GRANT USAGE ON SCHEMA public TO your_username;
       GRANT ALL PRIVILEGES ON SCHEMA public TO your_username;
       GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
       GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
       GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO your_username;
       ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO your_username;
       ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO your_username;
       ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO your_username;
       ```

4. **Environment Variables**
   - Set up environment variables through cPanel or `.htaccess` file

## API Endpoints

- `POST /smartbrain-api/register` - Register a new user
- `POST /smartbrain-api/login` - Login a user
- `GET /smartbrain-api/profile/:id` - Get user profile
- `PUT /smartbrain-api/image` - Update user entries
- `POST /smartbrain-api/clarifai` - Make a Clarifai API request
- `GET /smartbrain-api/requests/remaining` - Check remaining API requests

## Database Schema

The application uses PostgreSQL with the following schema:

- **User** - Stores user information
- **LoginHistory** - Tracks login attempts
- **ImageEntry** - Records submitted images and detection results
- **ApiRequest** - Tracks API usage

## Generating documentation

To generate documentation, run the following command:

```bash
npm run docs
```

The documentation will be generated in the `docs` directory.

## License

This project is licensed under the MIT License.

## Author

[Fortfel](https://twitter.com/Fortel91)
