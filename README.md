# Fashion & Co.

A premium, production-ready fashion e-commerce platform built for a Nairobi-based womenswear and jewelry brand.

Fashion & Co. provides a sophisticated digital storefront for customers to browse curated collections, view high-quality editorial imagery, and securely purchase luxury garments. It includes a complete consumer-facing storefront, a seamless checkout experience with regional payment integrations, and a robust administrative dashboard for staff to manage inventory, orders, and catalogue data.

## Overview

- **Stage**: Active Development
- **Target Audience**: High-end fashion consumers and internal operations staff.
- **Core Value**: Delivers an editorial-quality shopping experience with blazing-fast performance and seamless state management.

## Features

### Implemented
- **Editorial Storefront**: Dynamic, animated product galleries, responsive product grids, and premium filter sidebar architecture.
- **Cart & Checkout**: Optimistic UI state management (Zustand) synced with server-side Supabase database.
- **User Authentication**: Secure email/password login via Supabase Auth (SSR configured).
- **Admin Dashboard**: Secure routes for staff to manage products, categories, orders, and customers.
- **Role-based Access Control (RBAC)**: Distinct permissions for `admin`, `staff`, and `customer`.
- **Database & Storage**: PostgreSQL schema with Row-Level Security (RLS) and integrated bucket storage for product imagery.
- **Search & Filtering**: Highly responsive, URL-driven filtering (Size, Color, Category, Price) allowing easy link sharing.

### In Progress
- **Pesapal Integration**: Connecting regional mobile-money and card payment gateway.
- **Inventory Management**: Real-time stock reservation system during checkout.

### Planned
- **Order Tracking**: Customer-facing shipment timeline.
- **Email Notifications**: Automated order confirmations and shipping updates via Resend.
- **Review System**: Verified customer product reviews.

## Technology Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **UI & Styling** | Tailwind CSS, Radix UI, Framer Motion |
| **State Management**| Zustand |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth (with SSR Cookies) |
| **Storage** | Supabase Storage (Public Buckets) |
| **Emails** | Resend |
| **Payments** | Pesapal (Kenya/Regional) |
| **Form Handling** | React Hook Form & Zod |

## Project Structure

```text
.
├── src/
│   ├── app/                # Next.js App Router (pages and layouts)
│   │   ├── (auth)/         # Authentication routes (sign-in, sign-up)
│   │   ├── (storefront)/   # Public shopping routes (collections, products)
│   │   ├── admin/          # Staff dashboard
│   │   ├── account/        # Customer profile and order history
│   │   ├── checkout/       # Checkout flow
│   │   └── api/            # Serverless API endpoints
│   ├── components/         # Reusable React components
│   │   ├── admin/          # Admin-specific UI
│   │   ├── layout/         # Headers, footers, and structural components
│   │   ├── storefront/     # Storefront-specific UI (Product Cards, Filters)
│   │   └── ui/             # Primitive UI components (Radix + Tailwind)
│   ├── lib/                # Core utilities, queries, and server actions
│   │   ├── store/          # Zustand global state (Cart)
│   │   ├── queries/        # Database query functions
│   │   └── supabase/       # Supabase client initializers
│   └── types/              # Global TypeScript interfaces and DB schema types
├── supabase/
│   ├── migrations/         # Sequential SQL schema migrations
│   └── scripts/            # Helper scripts (e.g., assigning user roles)
└── public/                 # Static assets (fonts, logos)
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local database development)

### 1. Clone & Install
```bash
git clone <repository-url>
cd Fashion-and-Co
npm install
```

### 2. Environment Variables
Copy the template and fill in the values:
```bash
cp .env.local.example .env.local
```
*(See the Environment Variables section below for details)*

### 3. Database Setup (Supabase Local)
Ensure Docker is running, then initialize the local Supabase environment:
```bash
supabase start
```
This will automatically apply all migrations in `supabase/migrations/` and seed the database.

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

### 5. Linting & Formatting
```bash
npm run lint
npm run format
npm run typecheck
```

## Environment Variables

The application requires the following variables in `.env.local`:

- `NEXT_PUBLIC_SITE_URL`: The base URL of the application (e.g., `http://localhost:3000`).
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase admin key (NEVER expose to the browser, used for admin tasks/webhooks).
- `RESEND_API_KEY`: API key for transactional emails.
- `RESEND_FROM_EMAIL`: The verified sender email address.
- `PESAPAL_CONSUMER_KEY`: Payment gateway key.
- `PESAPAL_CONSUMER_SECRET`: Payment gateway secret.
- `PESAPAL_CALLBACK_URL`: Redirect URL after payment.

## Database

The database is built on PostgreSQL via Supabase, utilizing strict Row-Level Security (RLS) to protect customer data.

- **Migrations**: Found in `supabase/migrations/`. They run sequentially to build tables for users, catalogues, shopping carts, orders, and payments.
- **Seeding**: The `0012_demo_seed.sql` migration automatically populates the database with realistic demo products, collections, and Unsplash placeholder images.
- **Applying Changes**: If you modify the schema locally, create a new migration via `supabase migration new <name>`.

## Authentication

We use **Supabase Auth** integrated with Next.js SSR cookies to ensure layouts and pages can securely read session data server-side before rendering.

- **Customer**: Default role. Can manage their own cart, orders, and wishlist.
- **Staff / Admin**: Special roles managed via `public.user_roles`. Grants access to the `/admin` dashboard and bypasses certain RLS policies (e.g., viewing inactive products).
- **Role Assignment**: Use the SQL snippets in `supabase/scripts/` (e.g., `make_admin.sql`) to elevate a user in your local or production database.

## Deployment

This project is optimized for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. In the Vercel dashboard, add all the environment variables listed in `.env.local`.
3. Link your Vercel project to your production Supabase instance.
4. Deploy. Vercel will automatically run `npm run build`.

## Coding Standards

- **Server vs Client**: Default to React Server Components (RSC). Only use `'use client'` when state (`useState`), effects (`useEffect`), or browser APIs are required (e.g., UI interactions).
- **Data Fetching**: Fetch data directly in Server Components using Supabase server clients. Do not fetch from internal Next.js API routes inside Server Components.
- **State**: Use the URL (`useSearchParams`, `useRouter`) as the single source of truth for sharable state (like product filters). Use Zustand exclusively for complex client-side session state (like the Shopping Cart).
- **Styling**: Use Tailwind CSS with utility classes. Extract complex, reused combinations into `src/components/ui/` using `cva` (Class Variance Authority).

## Performance

- **Images**: Uses `next/image`. Currently, `unoptimized: true` is set in `next.config.mjs` to bypass local server rate-limiting timeouts from Unsplash placeholder images during development.
- **Fonts**: Optimized via `next/font` (Google Fonts: Montserrat, Playfair Display) eliminating layout shift.
- **Caching**: Leverages Next.js Data Cache and Full Route Cache. Time-based revalidation (`export const revalidate = 300`) is used heavily on storefront catalogue pages.

## License

Licensing is to be determined.

## Acknowledgements

- Built with [Next.js](https://nextjs.org/)
- Database & Auth by [Supabase](https://supabase.com/)
- UI primitives by [Radix UI](https://www.radix-ui.com/) and [Shadcn UI](https://ui.shadcn.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
