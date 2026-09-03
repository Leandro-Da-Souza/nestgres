# Nestgres

A full-stack dashboard application built as a hands-on exploration of NestJS, PostgreSQL, Angular, authentication, authorization, and multi-tenant data access.

The backend uses raw parameterized PostgreSQL queries rather than an ORM. The frontend is being built with modern Angular using standalone components, reactive forms, signals, and RxJS.

## Project status

The NestJS API is functional and covered by end-to-end tests.

The Angular frontend is currently in development, beginning with authentication and the dashboard interface.

## Tech stack

### Backend

* NestJS
* PostgreSQL
* `node-postgres`
* JWT authentication
* Argon2 password hashing
* class-validator
* Jest and Supertest

### Frontend

* Angular
* TypeScript
* RxJS
* Angular reactive forms
* SCSS

## Repository structure

```text
nestgres/
├── apps/
│   ├── api/        # NestJS and PostgreSQL API
│   └── web/        # Angular frontend
├── package.json
└── package-lock.json
```

The repository uses npm workspaces to manage both applications.

## Backend features

* Organization, user, and invoice CRUD operations
* Raw, parameterized PostgreSQL queries
* DTO validation
* PostgreSQL constraints and error translation
* JWT-based authentication
* Argon2 password verification
* Global authentication and role guards
* Organization-level tenant isolation
* Role-based access for members, admins, and super-admins
* Dashboard totals and organization summaries
* Invoice totals grouped by currency
* Consistent API response metadata
* End-to-end API tests using a dedicated PostgreSQL test database

## Roles and access

| Role          | Access                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------- |
| `member`      | Authentication and profile access                                                            |
| `admin`       | Read access to their organization and its users; management of their organization’s invoices |
| `super_admin` | Global organization, user, invoice, and dashboard access                                     |

Role checks are combined with SQL-level organization constraints. Authorization therefore controls both what an authenticated user may do and which organization’s records they may access.

## Dashboard

The dashboard API provides:

* Organization count
* Invoice count
* Active-user count
* Invoice and outstanding totals grouped by currency
* Per-organization user and invoice counts
* Per-organization totals grouped by currency
* Recent invoices

Monetary values are returned as strings to preserve PostgreSQL `numeric` precision and avoid JavaScript floating-point inaccuracies.

## Getting started

### Requirements

* Node.js
* npm
* PostgreSQL

### Install dependencies

From the repository root:

```bash
npm install
```

### Configure the API

Create `apps/api/.env` with the PostgreSQL and JWT configuration:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=your_development_database

JWT_SECRET=your_development_secret
JWT_EXPIRES_IN=15m
```

The PostgreSQL schema is currently managed manually and has not yet been added as versioned migrations.

### Run the API

```bash
npm run start:dev -w apps/api
```

The API runs at:

```text
http://localhost:3000
```

### Run the Angular frontend

```bash
npm run start -w apps/web
```

The frontend runs at:

```text
http://localhost:4200
```

## Testing

The API end-to-end tests perform real database operations and must use a dedicated disposable test database.

Set `TEST_PGDATABASE` to the name of that database:

```bash
TEST_PGDATABASE=nestgres_test \
npm run test:e2e -w apps/api -- --runInBand
```

The test setup includes a guard that prevents the e2e suite from running against an unconfirmed database name.

Do not point `TEST_PGDATABASE` at a development or production database.

## API response format

Successful responses are wrapped with data and request metadata:

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-09-03T12:00:00.000Z",
    "durationMs": 12,
    "path": "/dashboard",
    "method": "GET"
  }
}
```

The duration represents server-side request processing time.

## Current frontend roadmap

* Login using the NestJS authentication endpoint
* JWT storage and authenticated requests
* Angular HTTP interceptor
* Route guards
* Role-aware navigation
* Super-admin dashboard
* Organization-specific admin views
* Invoice management

## Purpose

Nestgres is a learning-focused project intended to develop a deeper practical understanding of:

* PostgreSQL and relational querying
* NestJS dependency injection and request lifecycle
* Authentication versus authorization
* Multi-tenant data isolation
* Angular architecture
* RxJS and reactive frontend patterns
* Full-stack API integration

The project favors explicit implementations and understandable boundaries over hiding behavior behind large abstractions.
