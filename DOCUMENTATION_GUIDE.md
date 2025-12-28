# Documentation Guide

This document explains the structure and purpose of all documentation files in the project.

## Canonical Reference

**`ARCHITECTURE.md`** - The single source of truth for all frontend architecture decisions.

This is the main document that all developers should reference. It contains:
- System role and constraints
- Requirement traceability
- Component contract design
- State and boundary mapping
- TDD strategy
- Implementation output
- Non-negotiable rules
- Success criteria

**Start here for any architectural questions.**

---

## Specialized Documentation

### AI Prompts (for AI-assisted development)

#### `ai-prompts/frontend/bdd-tdd-frontend-architecture.md`
**Purpose:** Original TDD-first architecture guide for the entire system.

**Contains:**
- Detailed system role definition
- Comprehensive requirement traceability for all pages
- Complete component contract design for all modules
- State and boundary mapping
- Extensive TDD strategy with test plan tables
- Implementation output with route maps and component hierarchies
- Type-safe contracts
- Test skeleton examples
- Open questions and guardrails

**When to use:** Reference this when implementing specific modules beyond the dashboard (products, inventory, orders, etc.)

#### `ai-prompts/frontend/frontend-design/generate-dashboard-components.md`
**Purpose:** Specialized prompt for generating dashboard components using BDD-TDD approach.

**Contains:**
- Dashboard-specific context and design reference
- Requirement traceability for dashboard page
- Component contracts for dashboard components
- State and boundary mapping for dashboard
- TDD strategy with test plan for dashboard
- Implementation output specific to dashboard
- Non-negotiable rules
- Success criteria
- Implementation checklist

**When to use:** Reference this when implementing dashboard-specific components (MetricCard, MetricsGrid, DashboardPage, etc.)

### Project Documentation

#### `_docs/frontend-architecture.md`
**Purpose:** Detailed architecture document with comprehensive test examples.

**Contains:**
- All component contracts with detailed specifications
- Complete store definitions
- Composable definitions
- Extensive test examples (Vitest, Vue Testing Library, Pinia)
- Route map with full configuration
- Component hierarchy tree
- Type-safe contracts
- Open questions and guardrails
- Performance considerations
- Next steps for developers

**When to use:** Reference this for detailed test examples and implementation patterns.

#### `testing-guide.md`
**Purpose:** Testing best practices and patterns for the project.

**Contains:**
- Testing philosophy and approach
- Unit testing patterns
- Component testing patterns
- Store testing patterns
- Integration testing patterns
- E2E testing patterns
- Accessibility testing
- Performance testing

**When to use:** Reference this when writing tests for any component or store.

#### `monorepo-implementation-guide.md`
**Purpose:** Monorepo structure and setup guide.

**Contains:**
- Monorepo structure explanation
- Package organization
- Workspace configuration
- Build and deployment setup
- Development workflow

**When to use:** Reference this for understanding the project structure and setup.

#### `README.md`
**Purpose:** Project overview and quick start guide.

**Contains:**
- Project description
- Quick start instructions
- Development setup
- Available scripts
- Project structure overview

**When to use:** Reference this for getting started with the project.

---

## Documentation Hierarchy

```
ARCHITECTURE.md (Canonical Reference)
├── DOCUMENTATION_GUIDE.md (This file)
├── ai-prompts/frontend/bdd-tdd-frontend-architecture.md (Full system architecture)
├── ai-prompts/frontend/frontend-design/generate-dashboard-components.md (Dashboard-specific)
├── _docs/frontend-architecture.md (Detailed with test examples)
├── testing-guide.md (Testing patterns)
├── monorepo-implementation-guide.md (Project structure)
└── README.md (Quick start)
```

---

## How to Use This Documentation

### For New Developers

1. Start with `README.md` for project overview
2. Read `ARCHITECTURE.md` for architectural principles
3. Review `testing-guide.md` for testing approach
4. Reference `_docs/frontend-architecture.md` for detailed examples

### For Implementing Dashboard Components

1. Read `ARCHITECTURE.md` sections on dashboard
2. Reference `ai-prompts/frontend/frontend-design/generate-dashboard-components.md` for detailed dashboard specs
3. Use `_docs/frontend-architecture.md` for test examples
4. Follow `testing-guide.md` for testing patterns

### For Implementing Other Modules

1. Read `ARCHITECTURE.md` for general principles
2. Reference `ai-prompts/frontend/bdd-tdd-frontend-architecture.md` for module-specific contracts
3. Use `_docs/frontend-architecture.md` for test examples
4. Follow `testing-guide.md` for testing patterns

### For Writing Tests

1. Review `testing-guide.md` for testing patterns
2. Reference `_docs/frontend-architecture.md` for test examples
3. Use `ARCHITECTURE.md` for component contracts
4. Follow the TDD strategy outlined in `ARCHITECTURE.md`

### For Understanding Project Structure

1. Read `monorepo-implementation-guide.md` for structure overview
2. Reference `README.md` for quick navigation
3. Use `ARCHITECTURE.md` for architectural decisions

---

## Key Principles Across All Documentation

### 1. Contract-First Development
All components must have clearly defined contracts (props, emits, slots) before implementation.

### 2. Test-Driven Development
Tests should be written before or alongside implementation, not after.

### 3. Accessibility First
All components must be keyboard navigable and screen reader compatible.

### 4. Type Safety
All props, emits, and state must be fully typed with TypeScript.

### 5. No Prop Drilling
Use stores and composables to avoid passing props through multiple levels.

### 6. Composition API Only
Use `<script setup lang="ts">` exclusively.

### 7. No Template Logic
Business logic must be in composables or stores, never in templates.

### 8. Semantic HTML
Use proper HTML elements (`<table>`, `<form>`, `<button>`, etc.).

---

## Documentation Maintenance

### When to Update Documentation

- When architectural decisions change
- When new patterns are established
- When component contracts are modified
- When testing strategies evolve
- When project structure changes

### How to Update Documentation

1. Update `ARCHITECTURE.md` first (canonical reference)
2. Update specialized documentation as needed
3. Ensure consistency across all documents
4. Update this guide if structure changes

### Consistency Checks

- All component contracts should match across documents
- All routes should be consistent
- All type definitions should be identical
- All testing patterns should align

---

## Quick Reference

### Component Contracts
- **Location:** `ARCHITECTURE.md` (summary), `_docs/frontend-architecture.md` (detailed)
- **Format:** Props, Emits, Slots, Expose, State, Features

### Test Examples
- **Location:** `_docs/frontend-architecture.md`
- **Types:** Composable tests, Component tests, Store tests, Integration tests

### Type Definitions
- **Location:** `ARCHITECTURE.md` (summary), `_docs/frontend-architecture.md` (detailed)
- **Format:** TypeScript interfaces

### Route Map
- **Location:** `ARCHITECTURE.md` (summary), `_docs/frontend-architecture.md` (detailed)
- **Format:** Route definitions with metadata

### Component Hierarchy
- **Location:** `ARCHITECTURE.md` (summary), `_docs/frontend-architecture.md` (detailed)
- **Format:** Tree view with Container/Presentational labels

### Testing Patterns
- **Location:** `testing-guide.md`
- **Types:** Unit, Component, Store, Integration, E2E, Accessibility

---

## Document Versions

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| ARCHITECTURE.md | 2.0.0 | 2024 | Current |
| DOCUMENTATION_GUIDE.md | 1.0.0 | 2024 | Current |
| ai-prompts/frontend/bdd-tdd-frontend-architecture.md | 1.0.0 | 2024 | Reference |
| ai-prompts/frontend/frontend-design/generate-dashboard-components.md | 1.0.0 | 2024 | Reference |
| _docs/frontend-architecture.md | 1.0.0 | 2024 | Reference |
| testing-guide.md | 1.0.0 | 2024 | Reference |
| monorepo-implementation-guide.md | 1.0.0 | 2024 | Reference |
| README.md | 1.0.0 | 2024 | Reference |

---

## Questions or Issues?

If you find inconsistencies or have questions about the documentation:

1. Check `ARCHITECTURE.md` first
2. Review the relevant specialized documentation
3. Consult `testing-guide.md` for testing questions
4. Check `monorepo-implementation-guide.md` for structure questions

All documentation should be consistent. If you find conflicts, `ARCHITECTURE.md` is the source of truth.
