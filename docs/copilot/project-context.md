# Project Context for GitHub Copilot

Concise project knowledge base for AI-assisted development with GitHub Copilot.

## Project Summary

**VideoTube** - A Node.js/Express REST API for a video-sharing platform (YouTube-like).

- **Tech Stack:** Express, MongoDB, Mongoose, JWT, Bcrypt, Cloudinary, Multer
- **Database:** MongoDB with 7 collections (users, videos, comments, likes, playlists, subscriptions, tweets)
- **Authentication:** JWT with access/refresh tokens, HTTP-only cookies
- **File Storage:** Cloudinary (via Multer temp storage)
- **API Version:** /api/v1/

## Architecture Layers

| Layer | Location | Responsibility |
|-------|----------|-----------------|
| **Routes** | `src/routes/` | HTTP endpoints, middleware application |
| **Controllers** | `src/controllers/` | Business logic, request validation, response formatting |
| **Models** | `src/models/` | Mongoose schemas, validation, methods |
| **Middleware** | `src/middlewares/` | JWT verification (verifyJWT), file upload (multer) |
| **Utils** | `src/utils/` | ApiError, ApiResponse, asyncHandler, Cloudinary upload |

## Standard Patterns

### Creating an API Endpoint

1. **Route** (`routes/feature.routes.js`):
```javascript
router.route("/endpoint").post(verifyJWT, controllerFunction);
```

2. **Controller** (`controllers/feature.controller.js`):
```javascript
const controllerFunction = asyncHandler(async (req, res) => {
  // 1. Validate input
  if (!req.body.field) throw new ApiError(400, "Field required");
  
  // 2. Database operation
  const result = await Model.create(req.body);
  
  // 3. Return response
  return res.status(201).json(
    new ApiResponse(201, result, "Success message")
  );
});
```

3. **Export** at bottom of controller file.

### Database Query Pattern

```javascript
// Simple find
const document = await Model.findById(id);

// Aggregation with joins
const result = await Model.aggregate([
  { $match: {...} },
  { $lookup: {from: "collection", localField: "_id", foreignField: "field", as: "joined"} },
  { $addFields: {joined: {$first: "$joined"}} },
  { $project: {field1: 1, field2: 1} }
]);

// Pagination
const options = {page: parseInt(page), limit: parseInt(limit)};
const result = await Model.aggregatePaginate(aggregate, options);
```

### Authorization Check Pattern

```javascript
// Always check ownership for resource-specific operations
if (resource.owner.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "You are not authorized");
}
```

### File Upload Pattern

1. Multer stores file: `req.file.path` or `req.files.fieldName[0].path`
2. Controller calls Cloudinary: `uploadOnCloudinary(filePath)`
3. Cloudinary returns: `{url, secure_url, duration, ...}`
4. Store URL in database, temp file auto-deleted

## Common Status Codes

- **200** - Success (GET, POST, PATCH that return data)
- **201** - Created (POST that creates resource)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (no/invalid token)
- **403** - Forbidden (not owner/authorized)
- **404** - Not Found
- **500** - Server Error

## Database Model Reference

| Model | Key Fields | Owner Field | Paginated |
|-------|-----------|------------|-----------|
| **User** | username, email, password (hashed), avatar, coverImage, watchHistory, refreshToken | - | - |
| **Video** | title, description, videoFile, thumbnail, duration, views, isPublished, owner | owner → User | Yes |
| **Comment** | content, video, owner | owner → User | Yes |
| **Like** | video/comment/tweet, likedBy | - | - |
| **Playlist** | name, description, videos[], owner | owner → User | - |
| **Subscription** | subscriber, channel | - | - |
| **Tweet** | content, owner | owner → User | - |

**Note:** Liked field indicates either video OR comment OR tweet (not all three).

## API Endpoints Quick Reference

### Users (9 endpoints)
- `POST /users/register` - Public
- `POST /users/login` - Public
- `POST /users/logout` - Protected
- `POST /users/refresh-token` - Public
- `POST /users/change-password` - Protected
- `GET /users/current-user` - Protected
- `PATCH /users/update-account` - Protected
- `PATCH /users/avatar` - Protected (multipart)
- `PATCH /users/cover-image` - Protected (multipart)
- `GET /users/c/:username` - Protected
- `GET /users/watch-history` - Protected

### Videos (6 endpoints)
- `POST /video/` - Protected (multipart)
- `GET /video/` - Protected (paginated, searchable)
- `GET /video/:videoId` - Protected (increments views)
- `PATCH /video/:videoId` - Protected (multipart)
- `DELETE /video/:videoId` - Protected
- `PATCH /video/toggle/publish/:videoId` - Protected

### Comments (4 endpoints)
- `GET /comment/:videoId` - Protected (paginated)
- `POST /comment/:videoId` - Protected
- `PATCH /comment/c/:commentId` - Protected
- `DELETE /comment/c/:commentId` - Protected

### Likes (4 endpoints)
- `POST /like/toggle/v/:videoId` - Protected
- `POST /like/toggle/c/:commentId` - Protected
- `POST /like/toggle/t/:tweetId` - Protected
- `GET /like/videos` - Protected

### Playlists (7 endpoints)
- `POST /playlist/` - Protected
- `GET /playlist/:playlistId` - Protected
- `PATCH /playlist/:playlistId` - Protected
- `DELETE /playlist/:playlistId` - Protected
- `PATCH /playlist/add/:videoId/:playlistId` - Protected
- `PATCH /playlist/remove/:videoId/:playlistId` - Protected
- `GET /playlist/user/:userId` - Protected

### Subscriptions (3 endpoints)
- `POST /subscription/c/:channelId` - Protected
- `GET /subscription/c/:channelId` - Protected
- `GET /subscription/u/:subscriberId` - Protected

### Tweets (4 endpoints)
- `POST /tweet/` - Protected
- `GET /tweet/user/:userId` - Protected
- `PATCH /tweet/:tweetId` - Protected
- `DELETE /tweet/:tweetId` - Protected

### Dashboard (2 endpoints)
- `GET /dashboard/stats` - Protected
- `GET /dashboard/videos` - Protected

### Health (1 endpoint)
- `GET /healthcheck/` - Public

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://...

# Server
PORT=8000

# JWT
ACCESS_TOKEN_SECRET=random_string
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=random_string
REFRESH_TOKEN_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Key Implementation Details

### JWT Flow
1. **Login** → Generate access (15m) + refresh (7d) tokens → Save refresh token in DB
2. **API Call** → Send access token → Middleware verifies → Controller executes
3. **Token Expires** → Frontend calls `/refresh-token` → Get new access token
4. **Logout** → Remove refresh token from DB → Clear cookies

### File Upload Flow
1. **Multer** → Save to `public/temp/` temporarily
2. **Controller** → Upload to Cloudinary → Get URL
3. **Database** → Store Cloudinary URL
4. **Cleanup** → Delete local temp file automatically

### View Tracking
- **Implicit** → Incremented on each GET video/:videoId call
- **Automatic** → No separate view recording needed

### Pagination
- **Default:** page=1, limit=10
- **Response:** totalDocs, totalPages, page, hasNextPage, hasPrevPage

## Common Gotchas

1. **Mongoose References** - Use `.populate()` or `$lookup` in aggregation
2. **Array IDs** - Convert to ObjectId when querying: `new mongoose.Types.ObjectId(id)`
3. **Owner Comparison** - Must convert to string: `owner.toString() === userId.toString()`
4. **Error Handling** - All async functions wrapped in `asyncHandler` - catches promise rejections
5. **Response Format** - Always return ApiResponse, never send raw objects
6. **Authorization** - Check ownership in controller, not middleware
7. **Cloudinary URLs** - Use `secure_url` for HTTPS compatibility
8. **Timestamps** - Automatically managed by Mongoose (createdAt, updatedAt)

## Useful Code Snippets

### Validate ObjectId
```javascript
if (!isValidObjectId(id)) {
  throw new ApiError(400, "Invalid ID");
}
```

### Generate JWT Token
```javascript
const token = jwt.sign({_id, email}, process.env.SECRET, {expiresIn: "15m"});
```

### Upload File to Cloudinary
```javascript
const response = await uploadOnCloudinary(localFilePath);
if (!response?.url) throw new ApiError(400, "Upload failed");
const url = response.secure_url;
```

### MongoDB Aggregation Join
```javascript
{
  $lookup: {
    from: "collection_name",
    localField: "foreignField",
    foreignField: "_id",
    as: "alias"
  }
}
```

### Add Field from Array
```javascript
{
  $addFields: {
    owner: { $first: "$owners" }  // Extract first element
  }
}
```

## Project File Structure

```
src/
├── index.js          # Entry, connect DB, start server
├── app.js            # Express setup, middleware, routes
├── constants.js      # DB_NAME = "videoTube"
├── routes/           # 9 route modules
├── controllers/      # 9 controller modules
├── models/           # 7 schema definitions
├── middlewares/      # verifyJWT, upload
├── utils/            # ApiError, ApiResponse, asyncHandler, cloudinary
└── db/
    └── index.js      # Mongoose connection
```

## Development Commands

```bash
npm run dev      # Start with nodemon (auto-reload)
npm install      # Install dependencies
npm ls --depth=0 # List dependencies
npm audit        # Check vulnerabilities
```

## Testing Quick Start

```bash
# Health check (no auth needed)
curl http://localhost:8000/api/v1/healthcheck/

# Register user
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "username=user1" -F "email=u@e.com" -F "password=pass" \
  -F "fullName=User" -F "avatar=@file.jpg"

# Login
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"u@e.com","password":"pass"}'

# Use returned accessToken in requests
curl http://localhost:8000/api/v1/users/current-user \
  -H "Authorization: Bearer <token>"
```

---

**Last Updated:** 2026-08-16

For detailed information, see full documentation in `/docs` folder.
