# TypeORM Configuration Setup

This document outlines the complete TypeORM configuration for the database package.

## Overview

TypeORM uses a data source configuration file and environment variables for database connections. The configuration includes:

1. **data-source.ts** - TypeORM data source configuration
2. **entities/** - Database entity definitions with decorators
3. **migrations/** - Database migration files
4. **seed.ts** - Database seeding script
5. **package.json** - Scripts to run TypeORM commands
6. **.env** - Environment variables (root level)

## File Structure

```
inventory-management/
├── .env (root)
│   ├── DB_HOST="localhost"
│   ├── DB_PORT="5432"
│   ├── DB_USERNAME="root"
│   ├── DB_PASSWORD="mysecretpassword"
│   └── DB_DATABASE="org_inventory"
└── packages/db/
    ├── package.json
    ├── src/
    │   ├── data-source.ts (TypeORM configuration)
    │   ├── entities/
    │   │   └── user.entity.ts
    │   ├── migrations/
    │   │   └── 1767480398655-NewMigration.ts
    │   └── seed.ts
    └── dist/
```

## Configuration Files

### 1. Root Environment File
**Location:** `/inventory-management/.env`

```env
DB_HOST="localhost"
DB_PORT="5432"
DB_USERNAME="root"
DB_PASSWORD="mysecretpassword"
DB_DATABASE="org_inventory"
```

### 2. Data Source Configuration
**Location:** `/inventory-management/packages/db/src/data-source.ts`

```typescript
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false, // Set to false for production
  logging: true,
  entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  subscribers: [],
});
```

### 3. Entity Example
**Location:** `/inventory-management/packages/db/src/entities/user.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;
}
```

### 4. Migration Example
**Location:** `/inventory-management/packages/db/src/migrations/1767480398655-NewMigration.ts`

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1767480398655 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
```

### 5. package.json Scripts
**Location:** `/inventory-management/packages/db/package.json`

```json
{
  "name": "@inventory/db",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "migration:create": "npm run typeorm -- migration:create src/migrations/NewMigration",
    "migration:run": "npm run build && npm run typeorm -- -d dist/data-source.js migration:run",
    "migration:revert": "npm run build && npm run typeorm -- -d dist/data-source.js migration:revert",
    "db:seed": "npm run build && dotenv -- node dist/seed.js",
    "typeorm": "dotenv -- node ./node_modules/typeorm/cli.js"
  },
  "dependencies": {
    "pg": "^8.11.3",
    "reflect-metadata": "^0.2.1",
    "typeorm": "^0.3.17"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/pg": "^8.10.9",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "dotenv-cli": "^7.3.0",
    "ts-node": "^10.9.2"
  }
}
```

## How It Works

1. When you run `pnpm -F @inventory/db migration:run`:
   - TypeScript compiles the source to `dist/`
   - TypeORM CLI loads the data source from `dist/data-source.js`
   - Environment variables are loaded from root `.env`
   - TypeORM connects to PostgreSQL and runs pending migrations

2. The data source configuration is responsible for:
   - Loading environment variables from the root `.env`
   - Defining entity and migration paths
   - Configuring database connection settings

## Key Points for TypeORM

- ✅ Data source configuration uses environment variables directly
- ✅ Entities use decorators for schema definition
- ✅ Migrations are written in TypeScript with up/down methods
- ✅ Build step required before running migrations
- ✅ Uses `reflect-metadata` for decorator support

## Troubleshooting

If you get connection errors:

1. **Check environment variables:** Ensure root `.env` has correct DB_* values
2. **Verify PostgreSQL:** Ensure database is running and accessible
3. **Check build:** Run `npm run build` before migrations
4. **Test connection:** `psql postgresql://root:mysecretpassword@localhost:5432/org_inventory -c "SELECT 1"`

If migrations fail:

1. **Check migration syntax:** Ensure SQL is valid PostgreSQL
2. **Verify entity decorators:** Ensure entities are properly decorated
3. **Check file paths:** Ensure paths in data-source.ts are correct
4. **Review logs:** Check TypeORM logging output for details

## Commands

```bash
# From monorepo root
pnpm -F @inventory/db build                    # Compile TypeScript
pnpm -F @inventory/db migration:create src/migrations/NewMigration  # Create migration
pnpm -F @inventory/db migration:run           # Run migrations
pnpm -F @inventory/db migration:revert        # Revert last migration
pnpm -F @inventory/db db:seed                 # Run seed script
```

## References

- [TypeORM Documentation](https://typeorm.io/)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [TypeORM Entities](https://typeorm.io/entities)
