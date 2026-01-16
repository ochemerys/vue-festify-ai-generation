import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Lazy-loaded AppDataSource
let appDataSourceInstance: DataSource | null = null;

function createDataSource(): DataSource {
  // Parse DATABASE_URL or use individual env vars
  let dbConfig: any;

  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL format: postgresql://username:password@host:port/database
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
      type: 'postgres' as const,
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
    };
  } else {
    // Fallback to individual env vars with defaults
    dbConfig = {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'mysecretpassword',
      database: process.env.DB_DATABASE || 'org_inventory',
    };
  }

  return new DataSource({
    ...dbConfig,
    synchronize: false, // Set to false for production
    logging: true,
    entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    subscribers: [],
  });
}

// Export a getter that creates the instance on first access
export function getAppDataSource(): DataSource {
  if (!appDataSourceInstance) {
    appDataSourceInstance = createDataSource();
  }
  return appDataSourceInstance;
}

// Export AppDataSource for backward compatibility (lazy initialization)
export const AppDataSource = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      return undefined;
    }
    return getAppDataSource()[prop as keyof DataSource];
  },
});
