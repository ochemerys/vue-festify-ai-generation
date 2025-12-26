# Environment Configuration Guide

## Overview

This monorepo uses a **single source of truth** for environment variables at the root level. All packages inherit these variables automatically.

## File Structure

```
inventory-management/
├── .env                          # ✅ MAIN - Root level (actual values)
├── .env.example                  # 📋 Example template
├── packages/
│   ├── db/
│   │   └── prisma/
│   │       └── .env.example      # 📋 Reference only
│   ├── backend/
│   │   └── .env.example          # 📋 Reference only
│   └── frontend/
│       └── .env.example          # 📋 Reference only
```

## Setup Instructions

### 1. Create Root `.env` File

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Backend
NODE_ENV="development"
PORT=3000
LOG_LEVEL=info

# Frontend
VITE_API_URL=http://localhost:3000/api

# JWT (if implementing auth)
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h
```

### 2. How Packages Access Variables

All packages automatically inherit from the root `.env`:

**Backend (Node.js):**

```typescript
const dbUrl = process.env.DATABASE_URL
const port = process.env.PORT
```

**Frontend (Vite):**

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

**Prisma:**

```bash
# Automatically reads DATABASE_URL from root .env
pnpm run db:migrate
pnpm run db:push
```

### 3. Environment-Specific Files

For different environments, use:

- `.env` - Development (local machine)
- `.env.production` - Production values
- `.env.staging` - Staging values

Load them with:

```bash
NODE_ENV=production pnpm run build
```

## Important Notes

⚠️ **DO NOT:**

- Commit `.env` files to git (they contain secrets)
- Create `.env` files in subdirectories (use root only)
- Duplicate connection strings across multiple files

✅ **DO:**

- Keep `.env.example` files for documentation
- Use the root `.env` as the single source of truth
- Add new variables to `.env.example` when adding features
- Use `.env.local` for local overrides (if needed)

## Prisma Configuration

Prisma automatically reads `DATABASE_URL` from the root `.env` file. The `prisma/prisma.config.ts` file handles the configuration:

```typescript
const databaseUrl = process.env.DATABASE_URL || 'postgresql://...'

export default {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
}
```

## Troubleshooting

**Issue:** Prisma can't find DATABASE_URL

- **Solution:** Ensure `.env` exists in the root directory with `DATABASE_URL` set

**Issue:** Different values in different `.env` files

- **Solution:** Delete all `.env` files except root `.env` and `.env.example`

**Issue:** Changes to `.env` not taking effect

- **Solution:** Restart your development server or terminal session

## Reference

- [Prisma Environment Variables](https://www.prisma.io/docs/reference/api-reference/environment-variables-reference)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
