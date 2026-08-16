# System Architecture

## Overview

VideoTube Backend is a layered REST API built with Node.js/Express, MongoDB, and file storage via Cloudinary. The architecture follows a traditional MVC-like pattern with clear separation of concerns.

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     External Clients                            │
│              (Frontend, Mobile Apps, Postman)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Express Server (PORT 8000)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Middleware Layer                                         │  │
│  │  • CORS & Cookie Parser                                 │  │
│  │  • Request Body Parser (JSON, URL-encoded)              │  │
│  │  • JWT Verification (verifyJWT)                         │  │
│  │  • File Upload Handler (Multer)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes Layer (src/routes/)                              │  │
│  │  • /api/v1/users          → userRouter                  │  │
│  │  • /api/v1/videos         → videoRouter                 │  │
│  │  • /api/v1/comment        → commentRouter               │  │
│  │  • /api/v1/like           → likeRouter                  │  │
│  │  • /api/v1/playlist       → playlistRouter              │  │
│  │  • /api/v1/subscription   → subscriptionRouter          │  │
│  │  • /api/v1/tweet          → tweetRouter                 │  │
│  │  • /api/v1/dashboard      → dashboardRouter             │  │
│  │  • /api/v1/healthcheck    → healthCheckRouter           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Controllers Layer (src/controllers/)                    │  │
│  │  • Handles requests, validates input                    │  │
│  │  • Calls business logic, manages responses              │  │
│  │  • Error handling with try-catch                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Models/Database Layer (src/models/)                     │  │
│  │  • Mongoose schemas                                     │  │
│  │  • Database queries, validation                         │  │
│  │  • Relationships (foreign keys via references)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Utility Layer (src/utils/)                              │  │
│  │  • ApiError: Error handling                             │  │
│  │  • ApiResponse: Response formatting                     │  │
│  │  • asyncHandler: Async/await wrapper                    │  │
│  │  • uploadOnCloudinary: File upload handler              │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               ↓ Mongoose ODM               ↓ File Uploads
        ┌────────────────┐          ┌──────────────────┐
        │   MongoDB      │          │   Cloudinary     │
        │  (videoTube DB)│          │  (Media Storage) │
        │                │          │                  │
        │  Collections:  │          │  Video files     │
        │  • users       │          │  Thumbnails      │
        │  • videos      │          │  Avatars         │
        │  • comments    │          │  Cover images    │
        │  • likes       │          │                  │
        │  • playlists   │          │                  │
        │  • subscriptions│         │                  │
        │  • tweets      │          │                  │
        └────────────────┘          └──────────────────┘
```

## Layered Architecture

### 1. **Route Layer** (`src/routes/`)
Defines HTTP endpoints and associates them with controllers.

**Characteristics:**
- Maps HTTP methods (GET, POST, PATCH, DELETE) to handler functions
- Applies middleware (authentication, file upload)
- Routes grouped by feature (users, videos, comments, etc.)

**Example:**
```javascript
// routes/user.routes.js
router.route("/register").post(upload.fields([...]), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
```

### 2. **Controller Layer** (`src/controllers/`)
Handles request processing and orchestrates business logic.

**Responsibilities:**
- Extract and validate input (request body, params, query)
- Call database models/services
- Handle errors with ApiError
- Format responses with ApiResponse
- Return HTTP responses

**Pattern:**
```javascript
const createResource = asyncHandler(async (req, res) => {
  // 1. Validate input
  if (!input) throw new ApiError(400, "Input required");
  
  // 2. Database operation
  const resource = await Model.create(input);
  
  // 3. Error check
  if (!resource) throw new ApiError(500, "Creation failed");
  
  // 4. Response
  return res.status(201).json(
    new ApiResponse(201, resource, "Success message")
  );
});
```

### 3. **Model Layer** (`src/models/`)
Defines database schemas and relationships.

**Key Models:**
- **User** - Accounts with authentication, profiles
- **Video** - Video content with metadata
- **Comment** - Comments on videos
- **Like** - Likes for videos, comments, tweets
- **Playlist** - Collections of videos
- **Subscription** - Channel subscriptions
- **Tweet** - Micro-posts

### 4. **Middleware Layer** (`src/middlewares/`)

#### JWT Verification Middleware
```javascript
verifyJWT - Validates access token, attaches user to req.user
```

**Flow:**
1. Extract token from cookies or Authorization header
2. Verify token with ACCESS_TOKEN_SECRET
3. Decode and fetch user from database
4. Attach user to request object
5. Pass control to next middleware/controller

**Error Cases:**
- No token → 404 Unauthorized
- Invalid signature → 401 Invalid token
- User not found → 404 Invalid token

#### File Upload Middleware
```javascript
upload.single("fieldName")     // Single file
upload.fields([...])            // Multiple fields
upload.array("fieldName")       // Multiple files same field
```

**Flow:**
1. Receives multipart/form-data
2. Stores file locally in `public/temp/`
3. Passes file path to controller
4. Controller uploads to Cloudinary
5. Cloudinary URL stored in database

### 5. **Utility Layer** (`src/utils/`)

#### ApiError
```javascript
throw new ApiError(statusCode, message, errors, stack);
```
- Standardized error format
- Passed to error handling middleware

#### ApiResponse
```javascript
new ApiResponse(statusCode, data, message);
```
- Consistent response format for all endpoints
- Automatically sets `success = (statusCode < 400)`

#### asyncHandler
```javascript
const handler = asyncHandler(async (req, res, next) => {
  // async code
});
```
- Wraps async route handlers
- Catches promises rejections
- Passes errors to error middleware

## Data Flow Diagrams

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Registration                        │
└─────────────────────────────────────────────────────────────┘

1. Client
   │ POST /api/v1/users/register
   │ {username, email, password, avatar file, coverImage file}
   ↓
2. multer.middleware
   │ Stores files temporarily in public/temp/
   ↓
3. user.controller.registerUser()
   │ • Validate input
   │ • Check duplicate username/email
   │ • Upload files to Cloudinary
   │ • Hash password (bcrypt)
   │ • Create User document
   ↓
4. User.model.create()
   │ • Pre-save hook hashes password
   │ • Stores user in MongoDB
   ↓
5. Response to Client
   └─ {user: {...}, statusCode: 201, success: true}

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    User Login                               │
└─────────────────────────────────────────────────────────────┘

1. Client
   │ POST /api/v1/users/login
   │ {email or username, password}
   ↓
2. user.controller.loginUser()
   │ • Find user by email or username
   │ • Validate password with bcrypt
   │ • Generate tokens
   │   - accessToken (15m expiry)
   │   - refreshToken (7d expiry)
   │ • Save refreshToken in User document
   ↓
3. Response to Client
   └─ Set cookies + return tokens in body
      {user, accessToken, refreshToken}

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                Protected API Request                        │
└─────────────────────────────────────────────────────────────┘

1. Client
   │ GET /api/v1/users/current-user
   │ Cookie: accessToken=jwt_token
   │ OR Authorization: Bearer jwt_token
   ↓
2. auth.middleware.verifyJWT()
   │ • Extract token from cookies or header
   │ • Verify with ACCESS_TOKEN_SECRET
   │ • Decode JWT → get user._id
   │ • Query User collection by _id
   │ • Attach user to req.user
   ↓
3. Controller processes request
   │ (Can access req.user for authorization)
   ↓
4. Response to Client
   └─ Request succeeds or authorization check fails

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                Refresh Access Token                         │
└─────────────────────────────────────────────────────────────┘

1. Client (token expired)
   │ POST /api/v1/users/refresh-token
   │ {refreshToken} or Cookie: refreshToken=jwt_token
   ↓
2. user.controller.refreshAccessToken()
   │ • Verify refreshToken with REFRESH_TOKEN_SECRET
   │ • Decode to get user._id
   │ • Query User, verify refreshToken matches
   │ • Generate new accessToken
   │ • Generate new refreshToken
   │ • Save new refreshToken in database
   ↓
3. Response to Client
   └─ {accessToken, refreshToken}
      Client updates cookies and retries original request
```

### Video Upload Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Publish Video                              │
└──────────────────────────────────────────────────────────────┘

1. Client
   │ POST /api/v1/video/
   │ multipart/form-data:
   │ • title, description
   │ • videoFile (binary)
   │ • thumbnail (binary)
   │ Authorization: Bearer accessToken
   ↓
2. Middleware Chain
   │ • verifyJWT → req.user = authenticated user
   │ • multer → stores files in public/temp/
   │   - videoFile → public/temp/video.mp4
   │   - thumbnail → public/temp/thumb.jpg
   ↓
3. video.controller.publishAVideo()
   │ • Validate title & description
   │ • Get file paths from req.files
   │ • Upload videoFile to Cloudinary
   │   └─ Returns: URL, duration, etc.
   │ • Upload thumbnail to Cloudinary
   │   └─ Returns: URL
   │ • Create Video document:
   │   - videoFile: cloudinary_url
   │   - thumbnail: cloudinary_url
   │   - duration: cloudinary_response.duration
   │   - owner: req.user._id
   │   - isPublished: true
   │   - views: 0
   ↓
4. Cleanup
   │ • Cloudinary utility deletes local files
   │   (public/temp/video.mp4, public/temp/thumb.jpg)
   ↓
5. Response to Client
   └─ {video: {...}, statusCode: 201, success: true}
      Frontend can now display video via cloudinary URLs
```

### Video Retrieval & View Count Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Get Single Video                           │
└──────────────────────────────────────────────────────────────┘

1. Client
   │ GET /api/v1/video/:videoId
   │ OR GET /api/v1/video/65a1b2c3d4e5f6g7h8i9j0k1
   ↓
2. video.controller.getVideoById()
   │ • Validate videoId (ObjectId format)
   │ • Increment view count: views += 1
   │ • Aggregation pipeline:
   │   1. $match: _id=videoId AND isPublished=true
   │   2. $lookup: Join with User collection (owner details)
   │   3. $addFields: Extract owner from array
   │   4. $project: Select fields to return
   ↓
3. Response to Client
   └─ {video: {
         videoFile: url,
         thumbnail: url,
         title: "...",
         description: "...",
         duration: 120,
         views: 42,  ← incremented
         owner: {username, fullName, avatar},
         isPublished: true,
         createdAt: "..."
      }, success: true}

─────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────────┐
│                   Get All Videos (Search & Paginate)         │
└──────────────────────────────────────────────────────────────┘

1. Client
   │ GET /api/v1/video/?query=funny&sortBy=views&sortType=desc&page=2&limit=10
   ↓
2. video.controller.getAllVideos()
   │ • Parse query params
   │ • Build aggregation pipeline:
   │   1. $match: isPublished = true
   │   2. $match: title/description matches query (regex, case-insensitive)
   │   3. $match: owner = userId (if provided)
   │   4. $sort: By sortBy field, ascending/descending
   │   5. $lookup: Join with User (owner details)
   │   6. $addFields: Flatten owner array
   │   7. $project: Select output fields
   │ • Apply pagination:
   │   - page 2, limit 10 → skip 10, limit 10
   ↓
3. Response to Client
   └─ {videos: [{...}, {...}],
      totalDocs: 150,
      totalPages: 15,
      page: 2,
      hasNextPage: true,
      hasPrevPage: true,
      success: true}
```

### Comment Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Add Comment to Video                       │
└──────────────────────────────────────────────────────────────┘

1. Client
   │ POST /api/v1/comment/:videoId
   │ {content: "Great video!"}
   │ Authorization: Bearer accessToken
   ↓
2. Middleware
   │ • verifyJWT → req.user = authenticated user
   ↓
3. comment.controller.addComment()
   │ • Validate videoId (ObjectId)
   │ • Validate content (not empty)
   │ • Create Comment document:
   │   - content: "Great video!"
   │   - video: videoId
   │   - owner: req.user._id
   │   - timestamps: auto
   ↓
4. Response to Client
   └─ {comment: {...}, statusCode: 201, success: true}

─────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────────┐
│                   Get Video Comments (Paginated)             │
└──────────────────────────────────────────────────────────────┘

1. Client
   │ GET /api/v1/comment/:videoId?page=1&limit=10
   ↓
2. comment.controller.getVideoComments()
   │ • Parse pagination params
   │ • Aggregation pipeline:
   │   1. $match: video = videoId
   │   2. $lookup: Join User (owner details)
   │   3. $unwind: Flatten owner
   │   4. $sort: createdAt descending (newest first)
   │   5. $project: Select fields
   │ • Paginate results
   ↓
3. Response to Client
   └─ {comments: [{owner, content, createdAt}, ...],
      totalDocs, totalPages, page, hasNextPage, hasPrevPage}
```

### Like/Unlike Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Toggle Video Like                          │
└──────────────────────────────────────────────────────────────┘

1. Client
   │ POST /api/v1/like/toggle/v/:videoId
   │ Authorization: Bearer accessToken
   ↓
2. Middleware
   │ • verifyJWT → req.user = authenticated user
   ↓
3. like.controller.toggleVideoLike()
   │ • Find Like document where:
   │   - video = videoId
   │   - likedBy = req.user._id
   │
   │ IF like exists:
   │   • Delete Like document → "unLiked"
   │ ELSE:
   │   • Create Like document → "Liked"
   │
   │ • Count total likes for video
   ↓
4. Response to Client
   └─ {likeCount: 42, message: "Video Liked Successfully"}
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│  Users                          Videos                       │
│  ├─ _id (PK)                    ├─ _id (PK)                 │
│  ├─ username (unique)           ├─ owner (FK → User._id) ◄──┼──┐
│  ├─ email (unique)              ├─ videoFile                 │  │
│  ├─ password (hashed)           ├─ thumbnail                 │  │
│  ├─ avatar (Cloudinary URL)     ├─ title                     │  │
│  ├─ coverImage                  ├─ description               │  │
│  ├─ watchHistory [Video._id]    ├─ duration                  │  │
│  ├─ refreshToken                ├─ views                     │  │
│  └─ timestamps                  ├─ isPublished               │  │
│                                 └─ timestamps                │  │
│  1 User ──────────► Many Videos (1:N via owner)             │  │
│                                                              │  │
└────────────────────────────────────────────────────────────┘   │
                                                               │
┌─────────────────────────────────────────────────────────────┐  │
│  Comments                       Likes                        │  │
│  ├─ _id (PK)                    ├─ _id (PK)                 │  │
│  ├─ content                     ├─ video (FK) ─────────────┘   │
│  ├─ video (FK → Video._id) ◄────┼──or comment (FK)            │
│  ├─ owner (FK → User._id)   │   ├─ or tweet (FK)              │
│  └─ timestamps              │   ├─ likedBy (FK → User._id)    │
│                             │   └─ timestamps                 │
│  N Comments ──┐             │                                  │
│  1 Video ─────┴─1 Video     │ Likes on multiple entities      │
│                             │                                  │
│  N Subscriptions ──────► N Videos                              │
│  ├─ subscriber (FK → User)  │                                  │
│  ├─ channel (FK → User)     │                                  │
│  └─ timestamps              │                                  │
│                             │                                  │
│  Playlists                  │ Tweets                          │
│  ├─ _id (PK)                │ ├─ _id (PK)                    │
│  ├─ name                    │ ├─ content                     │
│  ├─ description             │ ├─ owner (FK → User._id)       │
│  ├─ owner (FK → User._id)   │ └─ timestamps                  │
│  ├─ videos [Video._id]  ────┤─► Array of Video references   │
│  └─ timestamps              │                                  │
│                             │                                  │
│  1 Playlist ──► Many Videos (via videos array)               │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Strategy

All errors are caught and standardized:

```
Request Error
    ↓
try-catch block (in asyncHandler)
    ↓
throw new ApiError(statusCode, message, errors)
    ↓
Global error middleware (default Express)
    ↓
Response: {statusCode, data: null, message, success: false}
```

**Common Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad request (validation error)
- 401 - Unauthorized (no token)
- 403 - Forbidden (authorization failure)
- 404 - Not found
- 500 - Server error

## Response Format

All responses follow this format:

```json
{
  "statusCode": 200,
  "data": {
    /* response data specific to endpoint */
  },
  "message": "Operation successful",
  "success": true
}
```

## Key Design Decisions

1. **JWT Authentication** - Stateless, scalable, supports refresh tokens
2. **Dual Token Strategy** - Short-lived access tokens + long-lived refresh tokens
3. **Mongoose ODM** - Type safety, validation, hooks, relationships
4. **Aggregation Pipelines** - Complex queries with joins, sorting, pagination
5. **Cloudinary Integration** - Secure file storage, CDN, automatic cleanup
6. **asyncHandler Wrapper** - Consistent error handling across all routes
7. **Owner-based Authorization** - Decentralized permission checks in controllers
8. **Pagination** - Efficient for large result sets
9. **Mongoose Plugins** - Reusable aggregation pagination plugin

## Scalability Considerations

- **Database Indexing** - Created on frequently queried fields (username, email)
- **Pagination** - Prevents loading entire collections
- **Aggregation Pipelines** - Server-side filtering, joining, sorting
- **Stateless Authentication** - No session storage needed
- **Cloudinary** - Offload file storage and processing
- **Connection Pooling** - MongoDB connection reuse (built into Mongoose)

---

See also: [Project Structure](project-structure.md), [Database Schema](../database/schema.md)
