# Technology Stack

## Overview

VideoTube Backend uses a modern Node.js stack with Express, MongoDB, and cloud-based file storage. The stack emphasizes simplicity, reliability, and scalability.

## Core Technologies

### Runtime & Platform

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **npm** | Latest | Package manager |

**Status:** VERIFIED from Readme.md prerequisites

### Web Framework

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | ^5.1.0 | REST API framework, routing, middleware |

**Status:** VERIFIED from package.json

**Key Features Used:**
- `express()` - Create app instance
- `app.use()` - Register middleware
- `app.listen()` - Start server
- `Router()` - Create route modules
- Standard HTTP methods: GET, POST, PATCH, DELETE

### Database

| Package | Version | Purpose |
|---------|---------|---------|
| **mongoose** | ^8.18.3 | MongoDB object document mapper (ODM) |
| **mongoose-aggregate-paginate-v2** | ^1.1.4 | Pagination plugin for aggregation pipelines |

**Status:** VERIFIED from package.json

**Database:** MongoDB (NoSQL)
- Database Name: `videoTube`
- Collections: users, videos, comments, likes, playlists, subscriptions, tweets
- Connection: Via environment variable `MONGODB_URI`

**Mongoose Features Used:**
- Schemas and models
- Validation
- Pre/post hooks
- Aggregation pipelines
- Plugins
- References (relationships)

### Authentication & Security

| Package | Version | Purpose |
|---------|---------|---------|
| **jsonwebtoken** | ^9.0.2 | JWT token generation and verification |
| **bcrypt** | ^6.0.0 | Password hashing and comparison |
| **cookie-parser** | ^1.4.7 | Parse cookies from requests |
| **cors** | ^2.8.5 | Enable cross-origin requests |

**Status:** VERIFIED from package.json

**Security Features:**
- JWT tokens (access + refresh)
- Bcrypt password hashing
- HTTP-only cookies
- CORS configuration

### File Upload & Storage

| Package | Version | Purpose |
|---------|---------|---------|
| **multer** | ^2.0.2 | Multipart form-data file upload handling |
| **cloudinary** | ^2.7.0 | Cloud file storage and CDN |

**Status:** VERIFIED from package.json

**File Handling:**
- Multer: Temporary local storage (`public/temp/`)
- Cloudinary: Permanent cloud storage
- Supported file types: Auto (videos, images)
- Automatic cleanup of local files after upload

### Development Tools

| Package | Version | Purpose |
|---------|---------|---------|
| **nodemon** | ^3.1.10 | Auto-restart server on file changes |
| **prettier** | ^3.6.2 | Code formatter |
| **dotenv** | ^17.2.3 | Load environment variables from .env |

**Status:** VERIFIED from package.json

**Usage:**
- `npm run dev` starts server with nodemon and dotenv
- Watches `src/` directory for changes
- Auto-restart on file modification

## Architecture of Choices

### Why Express?
- Lightweight, fast, minimal
- Extensive middleware ecosystem
- Perfect for REST APIs
- Flexible routing

### Why MongoDB & Mongoose?
- Flexible schema for rapid development
- JavaScript-like query syntax
- Built-in validation and hooks
- Aggregation pipelines for complex queries
- Plugin system (used for pagination)

### Why JWT?
- Stateless authentication (no session storage needed)
- Scalable across multiple servers
- Works well with SPAs and mobile apps
- Token-based access/refresh pattern

### Why Cloudinary?
- No need to manage server storage
- Automatic CDN for fast delivery
- Built-in image/video processing
- Handles durability and availability

### Why Multer?
- De-facto standard for Node.js file uploads
- Integrates well with Express
- Supports single/multiple files, fields
- Disk storage for temporary files

## Environment Management

### Dotenv
- **Package:** `dotenv@^17.2.3`
- **File:** `.env` (not in git)
- **Loaded:** In `src/index.js` with `dotenv.config({path: "./.env"})`
- **Variables Used:**
  - `MONGODB_URI` - Database connection string
  - `PORT` - Server port (default 8000)
  - `ACCESS_TOKEN_SECRET` - JWT access token secret
  - `ACCESS_TOKEN_EXPIRY` - Token expiration (e.g., "15m")
  - `REFRESH_TOKEN_SECRET` - JWT refresh token secret
  - `REFRESH_TOKEN_EXPIRY` - Token expiration (e.g., "7d")
  - `CLOUDINARY_CLOUD_NAME` - Cloudinary account name
  - `CLOUDINARY_API_KEY` - Cloudinary API key
  - `CLOUDINARY_API_SECRET` - Cloudinary API secret
  - `CORS_ORIGIN` - Allowed frontend origin (e.g., "http://localhost:3000")

See [development/environment.md](development/environment.md) for detailed configuration.

## Dependency Management

### package.json Structure
- **type:** `"module"` - Uses ES6 import/export (not CommonJS)
- **main:** `"index.js"` - Entry point (not actually used for app start)
- **scripts:**
  - `dev` - `nodemon -r dotenv/config --experimental-json-modules src/index.js`
    - `-r dotenv/config` - Require dotenv before running
    - `--experimental-json-modules` - Allow importing JSON files

### Dependency Versions
- All use caret (^) versioning - allows minor/patch updates
- Pinned to specific minor versions for stability

### No Devtest Framework
- **Status:** UNKNOWN - No test framework detected in dependencies
- Recommendation: Would benefit from Jest, Mocha, or similar

## Performance Considerations

### Database
- **Mongoose connection pooling** - Built-in connection reuse
- **Indexes** - Created on User.username, User.email for quick lookups
- **Aggregation pipelines** - Server-side filtering reduces data transfer

### File Uploads
- **Temporary storage** - Files cleaned up immediately
- **Cloudinary CDN** - Global distribution
- **Auto optimization** - Cloudinary handles image/video encoding

### API
- **Pagination** - Prevents loading entire collections
- **Selective projection** - Queries return only needed fields
- **Lean queries** - Could be used to return plain objects (not verified in codebase)

## Scalability Architecture

### Stateless Design
- No session storage on server
- JWT tokens enable horizontal scaling
- Database is single source of truth

### Database Scaling
- MongoDB connection pooling (via Mongoose)
- Could support replication/sharding at DB level
- Indexes on frequently queried fields

### File Storage
- Cloudinary handles global distribution
- No server-side storage burden
- Could easily switch storage providers

### Future Considerations
- **Caching:** Redis for frequently accessed data (not currently implemented)
- **Message Queue:** Bull, RabbitMQ for background jobs (not currently implemented)
- **Load Balancer:** Needed for multi-instance deployment
- **API Gateway:** Kong, nginx for routing and rate limiting
- **Logging:** Winston, Morgan for structured logging (not currently implemented)

## Security Features

### Built-in
- **Password Hashing** - Bcrypt with salt
- **JWT Signing** - HMAC-SHA256
- **CORS** - Configurable origin validation
- **HTTP-only Cookies** - Protects against XSS
- **Environment Variables** - Secrets not in source code

### Recommendations (not verified as implemented)
- Rate limiting (express-rate-limit)
- Input validation/sanitization (joi, express-validator)
- HTTPS/TLS (via reverse proxy)
- Request logging and monitoring
- API versioning (/api/v1/)

## Code Quality

### Formatting
- **Prettier** ^3.6.2 - Code formatter (configured but usage pattern unknown)

### Potential Improvements
- **Linting** - ESLint not found
- **Testing** - No test framework
- **Type Safety** - No TypeScript (plain JavaScript)
- **API Documentation** - No Swagger/OpenAPI (documented manually)

## Comparison with Alternatives

### Express vs Alternatives
| Framework | Pros | Cons |
|-----------|------|------|
| **Express** (chosen) | Minimal, mature, ecosystem | Boilerplate-heavy |
| Fastify | Faster, more modern | Smaller community |
| Koa | More elegant async/await | Less mature |
| Nest.js | Full framework, TypeScript | Overkill for this project |

### MongoDB vs Alternatives
| Database | Pros | Cons |
|----------|------|------|
| **MongoDB** (chosen) | Flexible schema, easy dev | Not ACID (pre-v4), eventual consistency |
| PostgreSQL | ACID, relational | Rigid schema, more setup |
| Firebase | Fully managed, real-time | Vendor lock-in, cost at scale |

## Deployment Considerations

### Current Stack Can Deploy To:
- **Heroku** - With Procfile and env vars
- **AWS** - EC2, ECS, or Elastic Beanstalk
- **DigitalOcean** - Droplets or App Platform
- **Railway** - Automatic GitHub deployment
- **Render** - Similar to Railway
- **Docker** - Containerize with Dockerfile (not included)

### Requirements
- Node.js 18+ runtime
- MongoDB instance (Atlas, self-hosted, Docker)
- Cloudinary account
- Environment variables configured

### Database Deployment
- **Development:** Local MongoDB or MongoDB Atlas free tier
- **Production:** MongoDB Atlas production cluster or self-hosted replica set

## Monitoring & Observability

### Current Logging
- **Status:** Basic console.log statements
- Uses `console.log()` for app startup, database connection, Cloudinary uploads

### Recommendations (Not Implemented)
- Structured logging (Winston, Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Request logging (Morgan)
- Health checks (already have /api/v1/healthcheck)

## Summary of Stack

**Architecture Pattern:** Layered REST API  
**Language:** JavaScript (ES6+ with modules)  
**Runtime:** Node.js 18+  
**Web Framework:** Express.js  
**Database:** MongoDB with Mongoose  
**Authentication:** JWT (access + refresh tokens)  
**File Storage:** Cloudinary (via Multer temporary storage)  
**Development:** Nodemon + dotenv  
**Total Dependencies:** 10 production, 2 development  

**Complexity Level:** Low-Medium  
**Maturity:** Well-established technologies  
**Community Support:** Excellent  
**Learning Curve:** Low for Node.js developers  

---

See also: [Architecture](architecture.md), [Development Setup](development/setup.md)
