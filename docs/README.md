# VideoTube Backend Documentation

Welcome to the VideoTube Backend documentation. This guide provides comprehensive information about the backend system, architecture, API endpoints, database schema, and development workflows.

## Quick Navigation

- **[Architecture Overview](architecture.md)** - System design, architecture patterns, and data flow diagrams
- **[Project Structure](project-structure.md)** - Detailed breakdown of folder organization and file responsibilities
- **[Technology Stack](tech-stack.md)** - Technologies, frameworks, and libraries used
- **[API Reference](api/README.md)** - Complete REST API endpoint documentation
- **[Database Schema](database/schema.md)** - Database design, models, and relationships
- **[Authentication & Authorization](authentication.md)** - JWT flow, token management, security
- **[Business Logic & Features](features/README.md)** - Feature documentation and workflows
- **[Development Guide](development/setup.md)** - Local development setup, environment variables, running the server
- **[Copilot Context](copilot/project-context.md)** - AI-optimized project context for GitHub Copilot
- **[Discrepancy Audit](DOCUMENTATION-AUDIT.md)** - Documentation verification report

## System Overview

VideoTube is a RESTful Node.js/Express backend API for a video-sharing platform (similar to YouTube). It provides:

- **User Management** - Registration, login, authentication, profiles
- **Video Management** - Upload, publish, update, delete, view tracking
- **Social Features** - Comments, likes, subscriptions, playlists, tweets
- **Analytics** - Channel statistics and dashboard

### Key Characteristics

- **REST API** - Standard HTTP methods (GET, POST, PATCH, DELETE)
- **JWT Authentication** - Access and refresh token flow
- **MongoDB Database** - Persistent data storage with Mongoose ODM
- **File Storage** - Cloudinary integration for media uploads
- **Paginated Results** - Efficient pagination using mongoose-aggregate-paginate-v2
- **Error Handling** - Centralized error handling and consistent response format

## Architecture at a Glance

```
Frontend (Not included in this repo)
    ↓ HTTP/REST
Backend Express Server (src/app.js)
    ├── Routes Layer (src/routes/)
    ├── Controllers Layer (src/controllers/)
    ├── Models/Schemas (src/models/)
    ├── Middleware (src/middlewares/)
    └── Utilities (src/utils/)
    ↓
MongoDB Database (videoTube)
    ├── users
    ├── videos
    ├── comments
    ├── likes
    ├── playlists
    ├── subscriptions
    └── tweets
```

## Core Features

### 1. User Management (REST endpoints)
- User registration with avatar/cover image upload
- Login with JWT tokens
- Profile viewing
- Account updates (email, fullName)
- Password changes
- Watch history tracking

### 2. Video Management
- Publish videos (title, description, videoFile, thumbnail)
- Retrieve videos with pagination and search
- Update video metadata
- Toggle publish status (draft/published)
- Delete videos
- Automatic view count tracking
- Video ownership validation

### 3. Social Features
- **Comments** - Add, update, delete comments on videos
- **Likes** - Toggle likes on videos, comments, tweets
- **Subscriptions** - Subscribe/unsubscribe to channels
- **Playlists** - Create, manage, and view playlists with videos
- **Tweets** - Publish tweet-like micro-posts, manage tweets

### 4. Analytics
- Channel statistics (total videos, views, likes, subscribers)
- Channel videos list with pagination

## Authentication Model

**JWT with Dual Tokens:**
- **Access Token** - Short-lived (15m default), used for API requests
- **Refresh Token** - Long-lived (7d default), used to obtain new access tokens
- Tokens stored as HTTP-only cookies (secure, not accessible to JavaScript)
- Also returned in response body for flexible token management

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- MongoDB instance (local, Atlas, or Docker)
- Cloudinary account (optional for file uploads)

### Installation

```bash
# Install dependencies
npm install

# Create .env file with required variables
# See docs/development/environment.md for complete list

# Run development server
npm run dev
```

The server will start on port 8000 (or `$PORT` from environment).

## Common API Patterns

### Authentication
- **Public endpoints** - `/api/v1/users/register`, `/api/v1/users/login`, `/api/v1/healthcheck`
- **Protected endpoints** - Require `Authorization: Bearer <accessToken>` header or `accessToken` cookie
- **Authorization** - Owner-only operations validated in controllers

### Request/Response Format

**Success Response:**
```json
{
  "statusCode": 200,
  "data": { /* endpoint-specific data */ },
  "message": "Success message",
  "success": true
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

### Pagination
Endpoints returning lists support:
- `page` (default: 1)
- `limit` (default: 10)
- Response includes `totalDocs`, `totalPages`, `hasNextPage`, `hasPrevPage`

## Important Files & Folders

| Path | Purpose |
|------|---------|
| `src/index.js` | Server entry point, database connection |
| `src/app.js` | Express app setup, middleware, route mounting |
| `src/routes/` | Route definitions for each feature |
| `src/controllers/` | Business logic and request handlers |
| `src/models/` | Mongoose schemas and database models |
| `src/middlewares/` | JWT verification, file upload handling |
| `src/utils/` | Error handling, response formatting, file upload |
| `public/temp/` | Temporary file storage (Multer) |
| `.env` | Environment configuration (not in git) |
| `package.json` | Dependencies and scripts |

## Next Steps

1. **Understand the Architecture** - Read [architecture.md](architecture.md)
2. **Explore the API** - Check [api/README.md](api/README.md)
3. **Set up locally** - Follow [development/setup.md](development/setup.md)
4. **Trace a feature** - See [features/README.md](features/README.md)
5. **For AI/Copilot context** - See [copilot/project-context.md](copilot/project-context.md)

## Support

For more detailed information, refer to specific documentation files listed above.

---

**Last Updated:** 2026-08-16  
**Status:** Complete codebase analysis and documentation
