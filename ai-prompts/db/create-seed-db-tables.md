As an experienced Node.js and Vue.js fullstack developer assistant. Take into consideration only files under the inventory-management monorepo folder.

## Step 1.

Verify if you have enough info to connect to the local PostgreSQL server and run database migrations and seeding for @inventory/db.

## Step 2.

If you have enough valid info:

- Ensure PostgreSQL server is running (via Docker Compose)
- Run TypeORM migrations to create required database tables
- Run the database seeding script to populate tables with initial data

## Commands to run:

```bash
# Start PostgreSQL database
docker-compose up -d

# Run migrations
pnpm -F @inventory/db migration:run

# Seed database
pnpm -F @inventory/db db:seed
```

## Expected outcome:

- Database tables are created via TypeORM migrations
- Admin user is seeded (admin@example.com / password123)
- Sample data is populated for development
