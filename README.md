# Pawsitive – Frontend Architecture

> **Framework**: Next.js 16 (App Router) · **UI**: React 19 · **Styling**: Tailwind CSS 4 · **Language**: TypeScript 5  
> **API Base**: `NEXT_PUBLIC_API_URL` + `/api/v1`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Environment Variables](#4-environment-variables)
5. [API Layer](#5-api-layer)
6. [State Management](#6-state-management)
7. [Routing & Pages](#7-routing--pages)
8. [Shared Components](#8-shared-components)
9. [Styling Guide](#9-styling-guide)
10. [API Reference Summary](#10-api-reference-summary)
11. [Development Workflow](#11-development-workflow)

---

## 1. Project Overview

The **Pawsitive storefront** (`/frontend`) is the customer-facing Next.js web application for the Pawsitive pet shop. It consumes the public portion of the Laravel backend API to allow users to:

- Browse and filter pets by species, breed, gender, size, colour, age, price, and location.
- View full pet details with an image gallery and health record information.
- Manage a shopping cart (both as a guest and as a logged-in user, with cart merging on login).
- Register / log in to their account.
- Place Cash-on-Delivery orders with a delivery address.
- Track their orders (authenticated users via their history, guests via order number + email).

---

## 2. Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| HTTP Client | Native `fetch` (or lightweight Axios wrapper) |
| State | React Context API + `localStorage` persistence |
| Fonts | Google Fonts – Inter |
| Linting | ESLint 9 (`eslint-config-next`) |

---

## 3. Directory Structure

```
frontend/
├── public/                        # Static assets (logo, OG image, etc.)
├── src/
│   ├── app/                       # Next.js App Router pages + layouts
│   │   ├── layout.tsx             # Root layout (providers, Navbar, Footer)
│   │   ├── page.tsx               # Home – hero + featured pets
│   │   ├── pets/
│   │   │   ├── page.tsx           # Pet listing + filter sidebar
│   │   │   └── [id]/page.tsx      # Pet detail + image carousel
│   │   ├── auth/
│   │   │   ├── login/page.tsx     # Login form
│   │   │   └── register/page.tsx  # Registration form
│   │   ├── cart/page.tsx          # Cart review
│   │   ├── checkout/page.tsx      # Checkout (auth-guarded)
│   │   └── orders/
│   │       ├── page.tsx           # My Orders list (auth-guarded)
│   │       └── [orderNumber]/page.tsx  # Order detail / guest tracking
│   ├── components/                # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PetCard.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── PaginationBar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ImageCarousel.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/                   # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── lib/                       # API client + endpoint functions
│   │   ├── api.ts                 # Base fetch wrapper
│   │   └── endpoints/
│   │       ├── auth.ts
│   │       ├── pets.ts
│   │       ├── cart.ts
│   │       └── orders.ts
│   └── types/
│       └── index.ts               # All shared TypeScript interfaces
├── .env.local                     # Local environment variables
├── next.config.ts
├── tailwind.config.ts             # (if needed for v4 customisation)
├── postcss.config.mjs
├── FRONTEND.md                    # ← this file
└── package.json
```

---

## 4. Environment Variables

Create a `.env.local` file in the root of `/frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Note**: In production this should point to the deployed Laravel API domain.

---

## 5. API Layer

### 5.1 Base Client (`src/lib/api.ts`)

A thin wrapper around the native `fetch` that:

- Prepends `NEXT_PUBLIC_API_URL` to every relative path.
- Injects `Authorization: Bearer <token>` from `localStorage` when a token is present.
- Injects `X-Session-Id: <sessionId>` from `localStorage` for guest cart support.
- Returns a normalised `ApiResponse<T>` object on both success and error.

```ts
// Example signature
async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>>
```

### 5.2 Endpoint Modules

| Module | Functions |
|---|---|
| `endpoints/auth.ts` | `register()` · `login()` · `logout()` · `getProfile()` |
| `endpoints/pets.ts` | `listPets(filters: PetFilters)` · `getPet(id: string)` |
| `endpoints/cart.ts` | `getCart()` · `addItem(petId)` · `removeItem(id)` · `syncGuestCart(sessionId)` |
| `endpoints/orders.ts` | `placeOrder(payload)` · `listOrders()` · `trackOrder(orderNumber, email?)` |

### 5.3 Guest Cart Session

Before a user registers or logs in, a UUID v4 is generated and stored in `localStorage` as `x-session-id`. This value is sent as the `X-Session-Id` header on all cart requests. Upon login, `PUT /api/v1/cart` is called with `{ session_id }` to merge the guest cart into the authenticated user's cart.

---

## 6. State Management

### 6.1 `AuthContext`

```ts
interface AuthContextValue {
  user: User | null;
  token: string | null;
  login(credentials): Promise<void>;
  register(data): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated: boolean;
}
```

- Token and user persisted to `localStorage`.
- On app load the context rehydrates from storage and re-fetches `GET /api/v1/profile` to validate the token.

### 6.2 `CartContext`

```ts
interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  addToCart(petId: string): Promise<void>;
  removeFromCart(itemId: string): Promise<void>;
  refreshCart(): Promise<void>;
}
```

- Cart is fetched from `GET /api/v1/cart` on context mount.
- Guest session ID is created automatically if not already present in `localStorage`.
- On authentication changes (login/logout), the cart is refreshed to reflect server state.

---

## 7. Routing & Pages

### 7.1 Home (`/`)

- Full-width hero section with CTA linking to `/pets`.
- "Featured Pets" strip: 6 newest available pets via `GET /api/v1/pets?per_page=6&sort_by=created_at&sort_dir=desc`.

### 7.2 Pet Listing (`/pets`)

- Filter sidebar controls:

  | Filter | API Field |
  |---|---|
  | Search text | `search` |
  | Species | `species` |
  | Breed | `breed` |
  | Gender | `gender` |
  | Size | `size` (small / medium / large / extra_large) |
  | Colour | `color` |
  | Price range | `min_price` / `max_price` |
  | Age range (months) | `min_age` / `max_age` |
  | Behaviour | `behaviour` |
  | Location radius | `lat` / `lng` / `radius_km` (via browser Geolocation) |

- All active filters are reflected in the URL as query params (`?species=dog&min_price=5000`).
- Sorting dropdown: Price ↑ / Price ↓ / Age / Newest.
- Paginated grid using `<PetCard />` and `<PaginationBar />`.

### 7.3 Pet Detail (`/pets/[id]`)

- Image carousel using `images[]` from the pet payload; thumbnail is marked via `is_thumbnail`.
- Specification table: species, breed, age, gender, size, colour.
- Behaviour tags as styled chips.
- Health records section.
- **Add to Cart** button — disabled when `status !== 'available'` or item already in cart.

### 7.4 Login (`/auth/login`)

- Email + password fields.
- On success: token stored, guest cart merged, redirect to previous route.

### 7.5 Register (`/auth/register`)

- Fields: name, email, phone (optional), password, password_confirmation.
- On success: same flow as login.

### 7.6 Cart (`/cart`)

- Displays `<CartItem />` rows — pet thumbnail, name, price, remove button.
- Shows subtotal.
- Delivery fee fetched from backend settings (admin-configurable).
- "Proceed to Checkout" CTA → redirects to login if unauthenticated.

### 7.7 Checkout (`/checkout`) — *Auth Required*

- Address form: `address_line` (required), `city`, `area`.
- Payment: Cash on Delivery (only method; pre-selected).
- Optional order notes.
- Order summary sidebar.
- Calls `POST /api/v1/orders`. On success, redirects to `/orders/<orderNumber>`.

### 7.8 My Orders (`/orders`) — *Auth Required*

- Paginated order list: order number, date, item count, total, status badge.

### 7.9 Order Detail / Guest Tracking (`/orders/[orderNumber]`)

- **Authenticated**: loaded automatically.
- **Guest**: email input form shown first; submitted as `?email=` query param.
- Displays order status, timeline history, and delivery information.

---

## 8. Shared Components

### `<Navbar />`
- Logo + brand name (left).
- Nav links: Home, Browse Pets (centre/right).
- Cart icon with item-count badge using `cartCount` from `CartContext`.
- Login / Register buttons **or** user avatar dropdown (Profile, Logout) based on `isAuthenticated`.

### `<PetCard />`
- Thumbnail image, pet name, breed, age, price.
- Status badge if not `available`.
- "Add to Cart" button.

### `<FilterSidebar />`
- Collapsible on mobile.
- Each filter control updates URL search params (push state, no full reload).

### `<PaginationBar />`
- Previous / Next / page number buttons.
- Derives current page and total pages from `PaginatedResponse.meta`.

### `<StatusBadge />`
- Maps status strings to colour variants: `pending` → amber, `delivered` → green, `cancelled` → red, etc.

### `<ImageCarousel />`
- Main image display + thumbnail strip below.
- Keyboard and swipe navigable.

### `<ProtectedRoute />`
- Wrapper that redirects to `/auth/login?redirect=<currentPath>` if `!isAuthenticated`.

---

## 9. Styling Guide

- **Base**: Tailwind CSS 4 utility classes throughout. Avoid arbitrary values where design tokens suffice.
- **Palette**: Brand primary `#4F7942` (forest green) · Accent `#F5A623` (amber) · Neutrals from Tailwind `zinc` scale.
- **Typography**: Inter (Google Fonts) as the base font family, loaded via `next/font/google`.
- **Dark mode**: Tailwind `dark:` class strategy, toggled via `class` on `<html>`.
- **Responsive breakpoints**: Mobile-first. Sidebar collapses below `md` breakpoint.
- **Component-level styles**: Defined with `@apply` in a component stylesheet or in-line Tailwind classes — no CSS modules.

---

## 10. API Reference Summary

All public endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | – | Register new user |
| POST | `/login` | – | Log in, receive token |
| POST | `/logout` | Bearer | Log out |
| GET | `/profile` | Bearer | Get current user |
| GET | `/pets` | – | List/filter pets |
| GET | `/pets/{id}` | – | Single pet detail |
| GET | `/cart` | Session/Bearer | View cart |
| POST | `/cart/items` | Session/Bearer | Add pet to cart |
| DELETE | `/cart/items/{id}` | Session/Bearer | Remove cart item |
| PUT | `/cart` | Bearer | Merge guest cart |
| POST | `/orders` | Bearer/Guest | Place order |
| GET | `/orders` | Bearer | List my orders |
| GET | `/orders/{orderNumber}` | Optional | Track order |

> All requests and responses use `Content-Type: application/json`. Cart requests additionally require `X-Session-Id` header for guests.

---

## 11. Development Workflow

```bash
# Install dependencies (already done)
npm install

# Create .env.local and set NEXT_PUBLIC_API_URL

# Start the dev server
npm run dev
# → http://localhost:3000

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Production build (verify no type errors / broken imports)
npm run build
```

> **Backend**: Make sure the Laravel backend is running at the URL set in `NEXT_PUBLIC_API_URL` and CORS is configured to allow `http://localhost:3000`.
