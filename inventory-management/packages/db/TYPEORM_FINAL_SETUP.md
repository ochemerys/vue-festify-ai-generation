# TypeORM Final Configuration

## Complete Setup Summary

This is the final, working configuration for TypeORM with database migrations and seeding.

## File Locations and Contents

### 1. Root Environment File
**File:** `/inventory-management/.env`

```env
DB_HOST="localhost"
DB_PORT="5432"
DB_USERNAME="root"
DB_PASSWORD="mysecretpassword"
DB_DATABASE="org_inventory"
```

### 2. Data Source Configuration (CRITICAL)
**File:** `/inventory-management/packages/db/src/data-source.ts`

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

**Key Points:**
- Uses environment variables directly
- Defines paths to entities and migrations
- `synchronize: false` for production safety
- Located in `src/` directory

### 3. Entity Example
**File:** `/inventory-management/packages/db/src/entities/user.entity.ts`

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

**Key Points:**
- Uses TypeORM decorators
- Defines table name and column properties
- TypeScript types are inferred

### 4. Migration Example
**File:** `/inventory-management/packages/db/src/migrations/1767480398655-NewMigration.ts`

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

**Key Points:**
- Implements `MigrationInterface`
- `up()` method creates tables/indexes
- `down()` method reverses changes

### 5. Package Configuration
**File:** `/inventory-management/packages/db/package.json`

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

## Directory Structure

```
inventory-management/
├── .env
│   ├── DB_HOST="localhost"
│   ├── DB_PORT="5432"
│   ├── DB_USERNAME="root"
│   ├── DB_PASSWORD="mysecretpassword"
│   └── DB_DATABASE="org_inventory"
│
└── packages/db/
    ├── package.json
    ├── src/
    │   ├── data-source.ts          ← CRITICAL: TypeORM config
    │   ├── entities/
    │   │   └── user.entity.ts
    │   ├── migrations/
    │   │   └── 1767480398655-NewMigration.ts
    │   └── seed.ts
    ├── dist/
    └── tsconfig.json
```

## How It Works

1. **Run migration command:**
   ```bash
   pnpm -F @inventory/db migration:run
   ```

2. **TypeORM execution flow:**
   - TypeScript compiles source to `dist/`
   - TypeORM CLI loads `dist/data-source.js`
   - Environment variables loaded from root `.env`
   - TypeORM connects to PostgreSQL
   - Runs pending migrations from `dist/migrations/`

## Troubleshooting

### Error: "Connection failed"
- ✅ Ensure `prisma.config.cjs` is at package root (not in `prisma/` dir)
- ✅ Use `.cjs` extension (not `.js` or `.ts`)
- ✅ Use CommonJS syntax (`require` and `module.exports`)
- ✅ Keep the file minimal and simple

### Error: "Migration not found"
- ✅ Verify `prisma.config.cjs` exists at package root
- ✅ Check that `module.exports` includes `datasources.db.url`
- ✅ Ensure DATABASE_URL is set in root `.env` file

### Error: "Entity not found"
- ✅ Verify `/inventory-management/.env` exists
- ✅ Check that DATABASE_URL is defined in the file
- ✅ Verify the path in config file is correct: `../../.env`

## Commands

```bash
# From monorepo root
pnpm -F @inventory/db build                    # Compile TypeScript
pnpm -F @inventory/db migration:create src/migrations/NewMigration  # Create migration
pnpm -F @inventory/db migration:run           # Run migrations
pnpm -F @inventory/db migration:revert        # Revert last migration
pnpm -F @inventory/db db:seed                 # Run seed script

# Database management
docker-compose up -d                          # Start PostgreSQL
docker-compose down -v                        # Stop and remove volumes
psql postgresql://root:mysecretpassword@localhost:5432/org_inventory  # Connect to DB
```

## Important Notes

- Always run `npm run build` before migrations
- Use `synchronize: false` in production
- Environment variables loaded from root `.env`
- Migrations are compiled to `dist/` directory
- Entities use decorators for schema definition

## References

- [TypeORM Documentation](https://typeorm.io/)
- [TypeORM Migrations Guide](https://typeorm.io/migrations)
- [TypeORM Entities](https://typeorm.io/entities)
