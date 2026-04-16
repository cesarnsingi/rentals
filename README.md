# AngolaRentals 🏠

> **Full-stack rental marketplace for Angola** — Web + Mobile + Backend  
> Dark UI · Gold accent · AOA currency · Luanda, Benguela, Lubango

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript + MongoDB + Cloudinary |
| Web | React 18 + Vite + Tailwind CSS + Zustand + React Query |
| Mobile | React Native + Expo SDK 51 (iOS & Android) |
| Auth | JWT + Google OAuth |
| Images | Cloudinary (auto-resize to 1200px) |
| Infra | Docker Compose + Nginx |

---

## Project Structure

```
angola-rentals/
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── config/             # DB + Cloudinary
│   │   ├── controllers/        # auth, listings, bookings, admin
│   │   ├── middleware/         # JWT protect, requireRole
│   │   ├── models/             # User, Listing, Booking (Mongoose)
│   │   ├── routes/             # All API routes
│   │   ├── index.ts            # Express bootstrap
│   │   └── seed.ts             # Seed 40 Angola listings
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── web/                        # React web app
│   ├── src/
│   │   ├── components/         # Navbar, ListingCard, FilterPanel, UI system
│   │   ├── pages/              # Home, Listings, Detail, Dashboard, Admin
│   │   ├── store/              # Zustand auth store
│   │   ├── lib/                # Axios API client + utils
│   │   └── types/              # TypeScript interfaces
│   ├── Dockerfile
│   ├── tailwind.config.js
│   └── .env.example
│
├── mobile/                     # React Native (Expo)
│   ├── src/
│   │   ├── screens/            # Home, Listings, Detail, Favorites, Profile, Auth
│   │   ├── navigation/         # Bottom tabs + stack navigators
│   │   ├── components/         # ListingCard
│   │   ├── store/              # Zustand auth + AsyncStorage
│   │   ├── lib/                # Axios API client
│   │   └── constants/          # Colors, cities, helpers
│   ├── App.tsx                 # Root + React Query + notifications
│   └── app.json
│
├── infra/
│   └── nginx.conf              # Reverse proxy + SSL
├── docker-compose.yml
└── .env.example
```

---

## Quick Start — Local Development

### Prerequisites

```bash
node --version   # 20+
docker --version # 24+
```

### 1. Clone and install

```bash
git clone <your-repo> && cd angola-rentals

# Backend
cd backend && cp .env.example .env && npm install

# Web
cd ../web && cp .env.example .env && npm install

# Mobile
cd ../mobile && cp .env.example .env && npm install
```

### 2. Start MongoDB

```bash
# Option A — Docker (recommended)
docker run -d --name mongo -p 27017:27017 mongo:7

# Option B — MongoDB Atlas (free tier at mongodb.com)
# Copy your connection string to backend/.env → MONGODB_URI=
```

### 3. Configure backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/angola-rentals
JWT_SECRET=any-long-random-string-here

# Cloudinary (free at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Google OAuth (optional — get from console.cloud.google.com)
GOOGLE_CLIENT_ID=your_client_id

CORS_ORIGINS=http://localhost:3000,http://localhost:19006
```

### 4. Seed the database

```bash
cd backend
npm run seed
```

This creates **40 Angola property listings** across Luanda, Benguela, Lubango, Huambo.

**Test credentials:**
- Admin: `admin@angola-rentals.ao` / `Admin@1234`
- Landlord: `carlos@landlord.ao` / `Test@1234`

### 5. Run all apps

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → http://localhost:5000

# Terminal 2 — Web
cd web && npm run dev
# → http://localhost:3000

# Terminal 3 — Mobile
cd mobile && npx expo start
# Press i for iOS, a for Android, w for web
```

---

## Production Deployment

### Option A — Docker Compose (single server)

```bash
# 1. Set environment variables
cp .env.example .env
nano .env   # Fill JWT_SECRET, Cloudinary, Google Client ID

# 2. Add SSL certificate
mkdir -p infra/certs
# Copy fullchain.pem + privkey.pem to infra/certs/
# Or use Let's Encrypt: certbot certonly --standalone -d yourdomain.com

# 3. Update domain in infra/nginx.conf
sed -i 's/yourdomain.com/your-actual-domain.ao/g' infra/nginx.conf

# 4. Deploy
docker compose up -d --build

# 5. Seed production data
docker compose exec backend node dist/seed.js
```

### Option B — Separate services

| Service | Recommended |
|---|---|
| Backend | Railway / Render / DigitalOcean App |
| Web | Vercel (`vercel --prod`) |
| MongoDB | MongoDB Atlas (free M0 tier) |
| Images | Cloudinary (free 25GB) |

```bash
# Deploy web to Vercel
cd web && vercel --prod

# Deploy backend to Railway
railway init && railway up
```

### Mobile — App Stores

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build for Android
cd mobile && eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

## API Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Create account |
| POST | `/auth/login` | ✗ | Login → JWT |
| POST | `/auth/google` | ✗ | Google OAuth |
| GET | `/auth/me` | ✓ | Current user |
| PUT | `/auth/profile` | ✓ | Update profile |
| POST | `/auth/push-token` | ✓ | Save push token |

### Listings

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/listings` | Optional | List + filter + search |
| GET | `/listings/:slug` | Optional | Single listing |
| GET | `/listings/my` | ✓ | Landlord's listings |
| GET | `/listings/saved` | ✓ | User's saved listings |
| POST | `/listings` | Landlord | Create listing |
| PUT | `/listings/:id` | Owner | Update listing |
| DELETE | `/listings/:id` | Owner | Delete listing |
| POST | `/listings/:id/save` | ✓ | Toggle save |

**Query params for GET /listings:**

```
city, type, minPrice, maxPrice, bedrooms, furnished,
amenities (comma-separated), search, sort, page, limit, featured
```

### Bookings

| Method | Path | Description |
|---|---|---|
| POST | `/bookings` | Create booking request |
| GET | `/bookings` | User's or landlord's bookings |
| PUT | `/bookings/:id/status` | Confirm / cancel |

### Admin

| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard` | Stats + recent activity |
| GET | `/admin/users` | All users |
| PUT | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/listings` | All listings |
| PUT | `/admin/listings/:id/feature` | Feature a listing |

---

## Features

### Web App
- ✅ Home with hero search, featured listings, stats
- ✅ Listings page with sidebar filters (city, type, price, bedrooms, furnished, amenities)
- ✅ Property detail with image gallery, map link, WhatsApp/call/email contact
- ✅ Booking modal with date picker
- ✅ User dashboard (saved listings, bookings, my listings for landlords)
- ✅ Admin dashboard (users table, listings table, feature listings)
- ✅ JWT auth with login / register
- ✅ SEO meta tags (og:title, description, keywords)
- ✅ Lazy-loaded routes for performance
- ✅ Dark theme throughout

### Mobile App
- ✅ Home screen with city pills, property type grid, featured + recent listings
- ✅ Listings screen with search + filter modal (all filters)
- ✅ Property detail with image carousel, WhatsApp deeplink, native call, map
- ✅ Favorites screen (saved listings)
- ✅ Profile screen with bookings history
- ✅ Auth screen (login + register, role selection)
- ✅ Bottom tab navigation
- ✅ Push notification registration (Expo)
- ✅ Token hydration on app start
- ✅ Dark theme consistent with web

### Backend
- ✅ Multi-role auth (tenant / landlord / admin)
- ✅ Google OAuth
- ✅ Full CRUD for listings with Cloudinary image upload
- ✅ MongoDB text search across title, description, city
- ✅ Compound indexes for fast filter queries
- ✅ Rate limiting (auth routes: 10/15min, API: 100/min)
- ✅ Seed script (40 Angola listings + 4 landlords + admin)

---

## Angola Localization

- **Cities:** Luanda, Benguela, Lubango, Huambo, Malanje, Namibe, Soyo, Cabinda
- **Currency:** AOA (Kwanza) primary, USD secondary
- **Language:** Portuguese (pt-AO locale for date formatting)
- **WhatsApp:** Deep links with Angola country code (+244)
- **Property types:** Apartamento, Casa, Vivenda, Studio, Comercial, Quarto

---

## Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@angola-rentals.ao | Admin@1234 |
| Landlord | carlos@landlord.ao | Test@1234 |
| Landlord | maria@landlord.ao | Test@1234 |
| Landlord | joao@landlord.ao | Test@1234 |

---

```
AngolaRentals · Made for Angola 🇦🇴
```
