# LinkPulse API

REST API backend for **LinkPulse** -- a link management platform with campaign grouping, click analytics, custom OG metadata, and user management. Built with Express 5, MongoDB, and deployed on Vercel.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Links](#links)
  - [Campaigns](#campaigns)
  - [Profile](#profile)
  - [Upload](#upload)
- [Related Repositories](#related-repositories)
- [License](#license)

---

## Features

- **URL Shortening** -- Create short links with custom or auto-generated slugs.
- **Campaigns** -- Group links together and track aggregated performance (clicks over time, top countries/devices) per campaign.
- **Click Analytics** -- Track clicks with geographic location (country, city), device type, OS, browser, and referrer data.
- **Custom OG Metadata** -- Set custom Open Graph title, description, and image for each link, or auto-fetch from the destination URL. Served correctly to social crawlers even though real visitors get an instant server-side redirect.
- **Tags** -- Free-form tags per link for organizing outside of campaigns.
- **User Authentication** -- Register/login with email and password, or via Google OAuth. JWT-based access and refresh tokens stored in HTTP-only cookies.
- **Password Recovery** -- Forgot password flow with email-based reset tokens via Resend.
- **Profile Management** -- Update profile details, change password, upload avatar, and request account deletion with email confirmation.
- **Image Uploads** -- Upload images to Cloudinary with automatic resizing and optimization.
- **Rate Limiting** -- Global request rate limiting to prevent abuse.
- **Request Validation** -- Input validation using Zod schemas.
- **Swagger Documentation** -- Interactive API docs served at `/api-docs`.
- **Structured Logging** -- Application logging with Winston, including file-based log output.
- **Soft Deletes** -- Links, campaigns, and user accounts support soft deletion with timestamps.
- **Link Expiration** -- Optional expiry dates for short links.

---

## Tech Stack

| Category       | Technology                             |
| -------------- | --------------------------------------- |
| Runtime        | Node.js (ES Modules)                    |
| Framework      | Express 5                               |
| Database       | MongoDB with Mongoose ODM               |
| Authentication | JSON Web Tokens (jsonwebtoken), bcrypt  |
| File Storage   | Cloudinary                              |
| Email          | Resend                                  |
| Validation     | Zod                                     |
| Testing        | Vitest, Supertest, mongodb-memory-server |
| Documentation  | Swagger UI Express                      |
| Logging        | Winston, Morgan                         |
| Analytics      | geoip-lite, ua-parser-js                |
| OG Scraping    | open-graph-scraper                      |
| Deployment     | Vercel (Serverless)                     |

---

## Project Structure

```
src/
  app.js                    # Express app: middleware + routes (no listen/connect)
  server.js                 # Entry point: connects to MongoDB, starts the server
  swagger.json               # OpenAPI / Swagger spec
  config/
    db.js                   # MongoDB connection setup
  controllers/
    auth.controller.js      # Register, login, OAuth, password reset
    link.controller.js      # Link CRUD, redirect, analytics
    campaign.controller.js  # Campaign CRUD, aggregated stats
    profile.controller.js   # Profile management, account deletion
  emails/
    forgot-password.js      # Forgot password email template
    delete-account.js       # Account deletion confirmation email
  middlewares/
    auth.middleware.js      # JWT authentication guard
    multer.middleware.js    # File upload handling (Multer)
    rateLimit.middleware.js # Rate limiting configuration
  models/
    user.model.js           # User schema (name, email, password, Google ID, avatar)
    link.model.js            # Link schema (slug, destination, campaign, tags, OG metadata, expiry)
    campaign.model.js        # Campaign schema (name, description, owner, soft delete)
    click.model.js           # Click schema (IP, geo, device, browser, referrer)
  routes/
    index.js                # Route aggregator
    auth.route.js            # /api/auth/*
    link.route.js             # /api/links/*
    campaign.route.js         # /api/campaigns/*
    profile.route.js          # /api/profile/*
    upload.route.js           # /api/upload/*
  utils/
    cloudinary.js            # Cloudinary SDK configuration
    email.js                 # Resend email client setup
    link.js                  # Link helper utilities
    logger.js                # Winston logger configuration
    ogFetch.js                # OG metadata scraper
    response.js               # Standardized API response helper
    token.util.js              # JWT token generation and verification
  validators/
    auth.validator.js         # Zod schemas for auth input validation
    campaign.validator.js     # Zod schemas for campaign input validation
tests/
  setup.js                  # In-memory MongoDB lifecycle for tests
  helpers.js                 # Auth cookie helpers for authenticated requests
  auth.test.js                # Register/login coverage
  links.test.js                # Link creation, slug collisions, redirect/click recording
  campaigns.test.js             # Campaign CRUD, stats aggregation, unlinking
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account
- Resend account (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/AbdelrahmanMostafa0/linkpulse-api.git
cd linkpulse-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start the development server
npm run dev
```

The server will start on `http://localhost:9000` by default.

### Available Scripts

| Script        | Command                  | Description                  |
| ------------- | ------------------------- | ----------------------------- |
| `npm run dev` | `nodemon src/server.js`   | Start with hot-reload (dev)   |
| `npm start`   | `node src/server.js`      | Start in production mode      |
| `npm test`    | `vitest run`              | Run the test suite once       |

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# JWT
ACCESS_TOKEN_SECRET=<your-access-token-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Email (Resend)
RESEND_API_KEY=<your-resend-api-key>

# Server
PORT=9000
```

---

## Testing

The test suite spins up an in-memory MongoDB instance (via `mongodb-memory-server`) and exercises the real Express app with Supertest -- no test hits your real database.

```bash
npm test
```

Covers: registration/login validation and error paths, link creation and slug collisions, click recording on redirect, and campaign CRUD including aggregated stats and unlinking on delete.

---

## API Reference

Base URL: `/api`

Interactive documentation is available at `/api-docs` (Swagger UI).

### Authentication

| Method | Endpoint                    | Auth | Description                    |
| ------ | ---------------------------- | ---- | -------------------------------- |
| POST   | `/api/auth/register`         | No   | Register a new user             |
| POST   | `/api/auth/login`             | No   | Login with email and password   |
| POST   | `/api/auth/google`             | No   | Authenticate via Google OAuth   |
| POST   | `/api/auth/refresh`             | No   | Refresh the access token        |
| POST   | `/api/auth/logout`               | Yes  | Logout and clear tokens         |
| POST   | `/api/auth/forgot-password`       | No   | Request a password reset email  |
| POST   | `/api/auth/reset-password`         | No   | Reset password with token       |

### Links

| Method | Endpoint                      | Auth | Description                         |
| ------ | ----------------------------- | ---- | ------------------------------------ |
| POST   | `/api/links`                  | Yes  | Create a new short link (optional `campaignId`, `tags`) |
| GET    | `/api/links`                  | Yes  | List all links for the current user |
| GET    | `/api/links/stats`            | Yes  | Aggregated stats: totals, top links, clicks-by-date, top countries/devices/referrers |
| GET    | `/api/links/analytics/:slug`  | Yes  | Get detailed analytics for a link   |
| GET    | `/api/links/redirect/:slug`   | No   | Records a click and returns the link (used by the frontend's server-side redirect) |
| GET    | `/api/links/check-slug/:slug` | Yes  | Check if a slug is available        |
| GET    | `/api/links/og/:slug`         | No   | Get OG metadata for a link          |
| GET    | `/api/links/:slug`            | Yes  | Get a specific link by slug         |
| PUT    | `/api/links/:slug`            | Yes  | Update a link                       |
| DELETE | `/api/links/:slug`            | Yes  | Soft-delete a link                  |

### Campaigns

| Method | Endpoint                      | Auth | Description                            |
| ------ | ----------------------------- | ---- | ---------------------------------------- |
| POST   | `/api/campaigns`               | Yes  | Create a new campaign                    |
| GET    | `/api/campaigns`                | Yes  | List campaigns, each with `linksCount`/`totalClicks` |
| GET    | `/api/campaigns/:id`             | Yes  | Get a campaign by id                     |
| PUT    | `/api/campaigns/:id`              | Yes  | Update a campaign                        |
| DELETE | `/api/campaigns/:id`               | Yes  | Soft-delete a campaign (unlinks its links, doesn't delete them) |
| GET    | `/api/campaigns/:id/stats`          | Yes  | Aggregated analytics across the campaign's links |

### Profile

| Method | Endpoint                      | Auth | Description                            |
| ------ | ----------------------------- | ---- | -------------------------------------- |
| GET    | `/api/profile`                | Yes  | Get the current user's profile         |
| PATCH  | `/api/profile`                | Yes  | Update profile (name, avatar)          |
| PATCH  | `/api/profile/password`       | Yes  | Change password                        |
| PATCH  | `/api/profile/avatar`         | Yes  | Upload or update avatar                |
| DELETE | `/api/profile`                | Yes  | Request account deletion (sends email) |
| DELETE | `/api/profile/confirm-delete` | No   | Confirm account deletion via token     |

## Related Repositories

- **Frontend** -- [linkpulse](https://github.com/AbdelrahmanMostafa0/linkpulse)

---

## License

ISC
