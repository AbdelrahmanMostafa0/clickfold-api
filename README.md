# b8lnk API

REST API backend for **b8lnk** -- a modern URL shortener with analytics, custom OG metadata, and user management. Built with Express 5, MongoDB, and deployed on Vercel.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Links](#links)
  - [Profile](#profile)
  - [Upload](#upload)
- [Related Repositories](#related-repositories)
- [License](#license)

---

## Features

- **URL Shortening** -- Create short links with custom or auto-generated slugs.
- **Click Analytics** -- Track clicks with geographic location (country, city), device type, OS, browser, and referrer data.
- **Custom OG Metadata** -- Set custom Open Graph title, description, and image for each link, or auto-fetch from the destination URL.
- **User Authentication** -- Register/login with email and password, or via Google OAuth. JWT-based access and refresh tokens stored in HTTP-only cookies.
- **Password Recovery** -- Forgot password flow with email-based reset tokens via Resend.
- **Profile Management** -- Update profile details, change password, upload avatar, and request account deletion with email confirmation.
- **Image Uploads** -- Upload images to Cloudinary with automatic resizing and optimization.
- **Rate Limiting** -- Global request rate limiting to prevent abuse.
- **Request Validation** -- Input validation using Zod schemas.
- **Swagger Documentation** -- Interactive API docs served at `/api-docs`.
- **Structured Logging** -- Application logging with Winston, including file-based log output.
- **Soft Deletes** -- Links and user accounts support soft deletion with timestamps.
- **Link Expiration** -- Optional expiry dates for short links.

---

## Tech Stack

| Category       | Technology                             |
| -------------- | -------------------------------------- |
| Runtime        | Node.js (ES Modules)                   |
| Framework      | Express 5                              |
| Database       | MongoDB with Mongoose ODM              |
| Authentication | JSON Web Tokens (jsonwebtoken), bcrypt |
| File Storage   | Cloudinary                             |
| Email          | Resend                                 |
| Validation     | Zod                                    |
| Documentation  | Swagger UI Express                     |
| Logging        | Winston, Morgan                        |
| Analytics      | geoip-lite, ua-parser-js               |
| OG Scraping    | open-graph-scraper                     |
| Deployment     | Vercel (Serverless)                    |

---

## Project Structure

```
src/
  app.js                  # Application entry point
  swagger.json            # OpenAPI / Swagger spec
  config/
    db.js                 # MongoDB connection setup
  controllers/
    auth.controller.js    # Register, login, OAuth, password reset
    link.controller.js    # Link CRUD, redirect, analytics
    profile.controller.js # Profile management, account deletion
  emails/
    forgot-password.js    # Forgot password email template
    delete-account.js     # Account deletion confirmation email
  middlewares/
    auth.middleware.js     # JWT authentication guard
    multer.middleware.js   # File upload handling (Multer)
    rateLimit.middleware.js# Rate limiting configuration
  models/
    user.model.js         # User schema (name, email, password, Google ID, avatar)
    link.model.js         # Link schema (slug, destination, OG metadata, expiry)
    click.model.js        # Click schema (IP, geo, device, browser, referrer)
  routes/
    index.js              # Route aggregator
    auth.route.js         # /api/auth/*
    link.route.js         # /api/links/*
    profile.route.js      # /api/profile/*
    upload.route.js       # /api/upload/*
  utils/
    cloudinary.js         # Cloudinary SDK configuration
    email.js              # Resend email client setup
    link.js               # Link helper utilities
    logger.js             # Winston logger configuration
    ogFetch.js            # OG metadata scraper
    response.js           # Standardized API response helper
    token.util.js         # JWT token generation and verification
  validators/
    auth.validator.js     # Zod schemas for auth input validation
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
git clone https://github.com/AbdelrahmanMostafa0/b8lnk-api.git
cd b8lnk-api

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

| Script        | Command              | Description                 |
| ------------- | -------------------- | --------------------------- |
| `npm run dev` | `nodemon src/app.js` | Start with hot-reload (dev) |
| `npm start`   | `node src/app.js`    | Start in production mode    |

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

## API Reference

Base URL: `/api`

Interactive documentation is available at `/api-docs` (Swagger UI).

### Authentication

| Method | Endpoint                    | Auth | Description                    |
| ------ | --------------------------- | ---- | ------------------------------ |
| POST   | `/api/auth/register`        | No   | Register a new user            |
| POST   | `/api/auth/login`           | No   | Login with email and password  |
| POST   | `/api/auth/google`          | No   | Authenticate via Google OAuth  |
| POST   | `/api/auth/refresh`         | No   | Refresh the access token       |
| POST   | `/api/auth/logout`          | Yes  | Logout and clear tokens        |
| POST   | `/api/auth/forgot-password` | No   | Request a password reset email |
| POST   | `/api/auth/reset-password`  | No   | Reset password with token      |

### Links

| Method | Endpoint                      | Auth | Description                         |
| ------ | ----------------------------- | ---- | ----------------------------------- |
| POST   | `/api/links`                  | Yes  | Create a new short link             |
| GET    | `/api/links`                  | Yes  | List all links for the current user |
| GET    | `/api/links/stats`            | Yes  | Get aggregated link statistics      |
| GET    | `/api/links/analytics/:slug`  | Yes  | Get detailed analytics for a link   |
| GET    | `/api/links/redirect/:slug`   | No   | Redirect to the destination URL     |
| GET    | `/api/links/check-slug/:slug` | Yes  | Check if a slug is available        |
| GET    | `/api/links/og/:slug`         | No   | Get OG metadata for a link          |
| GET    | `/api/links/:slug`            | Yes  | Get a specific link by slug         |
| PUT    | `/api/links/:slug`            | Yes  | Update a link                       |
| DELETE | `/api/links/:slug`            | Yes  | Soft-delete a link                  |

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

- **Frontend** -- [b8lnk](https://github.com/AbdelrahmanMostafa0/b8lnk)

---

## License

ISC
