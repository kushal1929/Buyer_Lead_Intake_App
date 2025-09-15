# LeadFlowPro - Real Estate Lead Management System

## Overview

LeadFlowPro is a modern web application designed for real estate professionals to manage buyer leads efficiently. The system provides a comprehensive dashboard for tracking leads through their entire lifecycle, from initial contact to conversion. Built with a modern tech stack, it offers features like lead categorization, advanced search and filtering, analytics, and data import/export capabilities.

The application follows a full-stack architecture with a React frontend and Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database operations. The system is designed to handle real estate-specific data structures including property types, BHK configurations, budget ranges, and lead status tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript, using Vite as the build tool for fast development and optimized production builds. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing a consistent and accessible design system. TailwindCSS handles styling with a comprehensive design token system for colors, spacing, and theming.

State management is handled through TanStack Query (React Query) for server state management, providing caching, synchronization, and background updates. The application uses Wouter for client-side routing, offering a lightweight alternative to React Router.

The component architecture follows a modular approach with separate directories for UI components, page components, and business logic components. Custom hooks encapsulate data fetching and business logic, promoting code reuse and separation of concerns.

### Backend Architecture
The server is built with Express.js using TypeScript, implementing a REST API architecture. The application uses a layered architecture with clear separation between routes, business logic, and data access layers.

Rate limiting is implemented at multiple levels - general API rate limiting, enhanced rate limiting for lead creation endpoints, and per-user rate limiting for heavy operations. This provides protection against abuse while maintaining good user experience.

The storage layer uses an interface-based design (IStorage) that abstracts database operations, making it easy to swap implementations or add caching layers in the future.

### Data Storage Architecture
PostgreSQL serves as the primary database, chosen for its reliability, ACID compliance, and excellent support for complex queries needed for lead analytics and reporting.

Drizzle ORM provides type-safe database operations with automatic TypeScript type generation from the schema. The schema design includes comprehensive lead tracking with support for:
- User management and authentication
- Lead lifecycle tracking with status progression
- Property-specific fields (type, BHK, location, budget)
- Historical activity tracking for audit trails
- Flexible metadata storage using JSONB fields

Database migrations are managed through Drizzle Kit, ensuring consistent schema deployments across environments.

### Authentication and Session Management
The application uses session-based authentication with PostgreSQL session storage via connect-pg-simple. This approach provides better security for server-rendered applications and easier session invalidation compared to JWT tokens.

Sessions are configured with appropriate security headers and CORS policies for production deployment.

### Build and Deployment Architecture
The project uses a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. Vite handles the frontend build process with code splitting and optimization, while esbuild compiles the Node.js server for production.

The build system includes development-specific tooling like error overlays and hot module replacement, while production builds are optimized for performance and security.

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database using environment variable DATABASE_URL for connection configuration
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless) for cloud deployment
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect for database operations and migrations

### UI and Component Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives for building accessible components
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **shadcn/ui**: Pre-built component library built on Radix UI with Tailwind styling

### State Management and Data Fetching
- **TanStack Query**: Server state management library for caching, synchronization, and background updates
- **React Hook Form**: Form state management with validation support
- **Zod**: Schema validation library used with Drizzle for type-safe validation

### Development and Build Tools
- **Vite**: Frontend build tool with fast development server and optimized production builds
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler used for server-side compilation
- **PostCSS**: CSS processing pipeline with Tailwind integration

### Utility Libraries
- **date-fns**: Date manipulation and formatting library
- **clsx/tailwind-merge**: Utility libraries for conditional CSS class composition
- **nanoid**: Secure URL-friendly unique ID generator
- **express-rate-limit**: Request rate limiting middleware for API protection

### Development-Specific Dependencies
- **Replit Integration**: Special Vite plugins for Replit environment including error overlays and development banners
- **Wouter**: Lightweight client-side routing library
- **Class Variance Authority**: Utility for creating variant-based component APIs