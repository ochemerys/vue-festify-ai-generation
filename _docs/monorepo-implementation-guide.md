# Implementation Guide: The Monorepo Approach

## Step 1: Initialize the Workspace

Create a root folder and a pnpm-workspace.yaml to manage your projects.

```bash

mkdir inventory-management && cd inventory-management
touch pnpm-workspace.yaml
```

Add this to pnpm-workspace.yaml:

```YAML
packages:
  - 'apps/*'
  - 'packages/*' # For shared types/logic
```

## Step 2: Generate the Vue 3 Frontend

Inside apps/, use the official Vite create tool.

```bash
mkdir apps && cd apps
pnpm create vite frontend --template vue-ts
cd frontend
pnpm install -D tailwindcss @tailwindcss/vite
```

Note: In Vite, add the Tailwind plugin to vite.config.ts to enable the v4 engine.

## Step 3: Initialize the Node.js Backend

Create a TypeScript-based API in apps/api.

```bash
mkdir ../backend && cd ../backend

# Initialize and install dependencies
pnpm init
pnpm add fastify @fastify/cors zod
pnpm add -D typescript @types/node ts-node-dev

# Initialize TypeScript
npx tsc --init
```
