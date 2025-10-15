# Inventory Management System - Setup Instructions

This is an Electron desktop application with Supabase cloud database integration.

## Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. Supabase account

## Database Setup

1. Go to your Supabase project dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-schema.sql` in this project
4. Paste and run the SQL to create all necessary tables

## Installation

First, install Electron and related dependencies:

```bash
npm install electron@28.0.0 electron-builder@24.9.1 concurrently@8.2.2 wait-on@7.2.0 --save-dev
```

If you encounter network errors, try:
```bash
npm install electron@28.0.0 electron-builder@24.9.1 concurrently@8.2.2 wait-on@7.2.0 --save-dev --legacy-peer-deps
```

## Running the Application

### Development Mode
```bash
npm run electron-dev
```
This will:
- Start the Vite dev server on port 5173
- Launch the Electron app in development mode
- Enable hot module replacement

### Production Build
```bash
npm run dist
```
This will create a distributable package in the `release` folder.

## Available Scripts

- `npm run dev` - Start Vite dev server only
- `npm run build` - Build the React app for production
- `npm run electron` - Run Electron with built files
- `npm run electron-dev` - Run Electron in development mode
- `npm run electron-build` - Build the app and create installer
- `npm run dist` - Create production distribution

## Features

- Product inventory management
- Sales tracking
- Customer management
- Seller/employee management
- Returns processing
- Advanced reporting and analytics
- Low stock alerts
- Data export/import
- Cloud sync with Supabase
- Offline-capable (with sync when online)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop**: Electron 28
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **UI Icons**: Lucide React

## Database

The app uses Supabase for cloud database storage, which means:
- Data is synced across devices
- No local database file to manage
- Automatic backups
- Accessible from multiple installations

## Troubleshooting

### Electron won't start
Make sure you've run the installation command successfully and all Electron dependencies are installed.

### Database connection errors
1. Check that your `.env` file has the correct Supabase credentials
2. Ensure the database tables are created using the SQL schema
3. Verify your internet connection

### Build errors
Try clearing the cache:
```bash
rm -rf node_modules dist release
npm install
npm run build
```

## Project Structure

```
inventory-management-system/
├── electron/
│   ├── main.js         # Electron main process
│   └── preload.js      # Preload script
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks (useInventory)
│   ├── lib/            # Supabase client
│   ├── types/          # TypeScript types
│   └── App.tsx         # Main React component
├── dist/               # Built files (generated)
├── release/            # Distribution packages (generated)
├── package.json
├── supabase-schema.sql # Database schema
└── .env                # Supabase credentials
```
