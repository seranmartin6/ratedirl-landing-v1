# RatedIRL - Reputation Platform

## Overview

RatedIRL is a "Google Reviews for People" web application that allows users to rate and review real people with a consent-based, moderated system. The platform features user authentication, searchable profiles, star ratings with text reviews, a nomination/invite flow for adding new people, and admin moderation tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS v4 with custom theme variables and shadcn/ui component library
- **UI Components**: Radix UI primitives wrapped with shadcn/ui styling conventions

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful JSON API under `/api` prefix
- **Session Management**: Express-session with MemoryStore (development) or connect-pg-simple (production)
- **Authentication**: Custom session-based auth with bcryptjs password hashing
- **Build Process**: Custom esbuild script bundles server code; Vite builds client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions using Drizzle's pg-core
- **Key Tables**:
  - `users` - User accounts with auth credentials, KYC status, roles
  - `peopleProfiles` - Reviewable profiles (can be claimed by users)
  - `reviews` - Star ratings and text feedback with moderation status
  - `nominations` - Invite tokens for adding new people
  - `reports` - Content flagging for moderation
  - `profileViews` - Analytics tracking
  - `follows` - User follows for profiles (social feed feature)

### Social Feed Feature
- **Activity Feed**: Shows recent reviews, newly claimed profiles, and trending profiles
- **Filters**: All, Reviews, New Profiles, Trending, Following
- **Trending Algorithm**: Calculated from last 7 days data using formula: `views + (reviews × 10)`
- **Follow System**: Users can follow profiles to see their activity in the Following filter

### Authentication & Authorization
- Session-based authentication stored server-side
- Role-based access control with `user` and `admin` roles
- KYC status tracking (none/pending/verified) for reviewer verification
- Protected routes use `requireAuth` middleware; admin routes use `requireAdmin`

### Key Design Patterns
- **Shared Schema**: Database types and Zod validation schemas shared between client and server via `@shared` alias
- **Storage Abstraction**: `server/storage.ts` provides a data access layer abstracting Drizzle queries
- **API Request Helper**: `client/src/lib/queryClient.ts` provides typed fetch wrapper with error handling

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe SQL query builder and schema management
- **drizzle-kit**: Database migration tool (`npm run db:push`)

### Third-Party Services
- No external API integrations currently active
- Session secret configured via `SESSION_SECRET` environment variable

### Key NPM Packages
- `bcryptjs` - Password hashing
- `express-session` + `memorystore`/`connect-pg-simple` - Session management
- `zod` + `drizzle-zod` - Runtime validation
- `framer-motion` - Animations on landing page
- `date-fns` - Date formatting utilities