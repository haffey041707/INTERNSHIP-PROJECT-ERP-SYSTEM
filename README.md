# EduNexus ERP

EduNexus ERP is a responsive education management system for schools, colleges, universities, and training institutes. It includes institution signup, secure login, Google sign-in, dashboard analytics, student and staff management, classes, attendance, exams, fees, announcements, reports, and institution-specific ERP home sections.

The active runnable system is the Next.js app in `apps/web`.

## Features

- Multi-institution workspace setup
- Separate ERP modes for School, College, University, and Institute
- Responsive desktop and mobile layout
- Premium fixed `#0F172A` system theme
- Email and password authentication
- Google OAuth sign-in
- Institution ID lookup and change flow
- Password reset flow
- Dashboard with live KPIs and onboarding
- Students, teachers, classes, sections, attendance, exams, fees, parents, timetable, announcements, reports, settings, and service modules
- Institution profile settings for name, type, and currency
- Sample data loader and workspace data clear tools
- SQLite local development database with Prisma

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for local development
- pnpm workspace
- Turbo

## Project Structure

```text
edunexus-erp/
|-- apps/
|   |-- web/                 # Main runnable ERP app
|   `-- api/                 # API foundation
|-- packages/
|   |-- design-tokens/       # Shared design tokens
|   `-- types/               # Shared TypeScript types
|-- docs/                    # Architecture and planning documents
|-- infra/                   # Docker, Kubernetes, and infrastructure files
|-- prisma/                  # Architecture-level Prisma schema
|-- package.json
`-- README.md
```

## Local Setup

### 1. Install dependencies

```bash
corepack enable
corepack prepare pnpm@9.7.0 --activate
pnpm install
```

### 2. Create environment file

Copy the example file and update values if needed:

```bash
cp .env.example apps/web/.env
```

For local development the important values are:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="change-this-secret"
APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
```

Google sign-in is optional. Email and password login works without OAuth credentials.

### 3. Prepare the database

```bash
pnpm --filter @edunexus/web db:setup
```

### 4. Start the app

```bash
pnpm --filter @edunexus/web dev
```

Open:

```text
http://localhost:3000
```

## Google Sign-In Setup

To enable Google login:

1. Go to Google Cloud Console.
2. Create an OAuth Client ID for a web application.
3. Add this authorized redirect URI:

```text
http://localhost:3000/api/auth/google/callback
```

4. Add the generated values to `apps/web/.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

5. Restart the dev server.

## Institution Types

The system changes its main ERP home based on the institution type selected in Settings:

- `SCHOOL` opens School ERP features
- `COLLEGE` opens College ERP features
- `UNIVERSITY` opens University ERP features
- `INSTITUTE` opens Institute ERP features

Changing the institution name or type in Settings updates the system profile and redirects to the correct ERP home.

## Useful Commands

```bash
pnpm --filter @edunexus/web dev
pnpm --filter @edunexus/web typecheck
pnpm --filter @edunexus/web build
pnpm --filter @edunexus/web db:generate
pnpm --filter @edunexus/web db:push
pnpm --filter @edunexus/web db:seed
pnpm --filter @edunexus/web db:setup
```

## Security Notes

Do not commit these files:

- `apps/web/.env`
- `apps/web/dev.db`
- `apps/web/prisma/dev.db`
- `.next/`
- `node_modules/`

They are ignored by `.gitignore`.

## Status

This repository contains a working education ERP prototype suitable for internship demonstration, local testing, and further development.
