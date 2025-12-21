# Inventory Management System

A full-stack inventory management system built with Vue 3, Fastify, and PostgreSQL.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Contracts**: Zod schemas for type-safe API contracts
- **Testing**: Vitest for unit tests
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

## Project Structure

```
inventory-management/
├── apps/
│   ├── frontend/          # Vue 3 application
│   └── backend/           # Fastify API server
├── packages/
│   ├── contracts/         # Shared Zod schemas and types
│   ├── db/               # Prisma database layer
│   └── bdd/              # Gherkin feature files
├── package.json          # Root package with workspace scripts
├── pnpm-workspace.yaml   # Workspace configuration
└── tsconfig.json         # Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. Set up the database:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

### Development

Start all services in development mode:

```bash
pnpm dev
```

This will start:

- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Building

Build all packages:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Available Scripts

### Root Scripts

- `pnpm dev` - Start all services in development
- `pnpm build` - Build all packages
- `pnpm start` - Start production backend
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

### Database Scripts

- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Create and run migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio

### Package Scripts

Each package has its own scripts:

- `pnpm --filter frontend dev` - Start frontend dev server
- `pnpm --filter backend dev` - Start backend dev server
- `pnpm --filter @inventory/db db:studio` - Open Prisma Studio

## Development Guidelines

### Code Quality

- Use TypeScript for all new code
- Follow ESLint rules
- Format code with Prettier
- Write tests for new features

### Architecture

- **Contracts First**: Define Zod schemas in `@inventory/contracts`
- **Type Safety**: Use inferred types from Zod schemas
- **Separation of Concerns**: Keep business logic in backend, UI in frontend
- **Database Abstraction**: Use Prisma client through `@inventory/db`

### Testing

- Unit tests with Vitest
- Frontend tests use jsdom environment
- Backend tests use node environment
- Run `pnpm test:watch` for continuous testing

## Contributing

1. Follow the established patterns
2. Write tests for new features
3. Ensure all linting passes
4. Format code before committing
5. Update documentation as needed

## License

ISC
