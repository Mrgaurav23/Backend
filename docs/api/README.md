# API Reference

Complete REST API documentation for VideoTube Backend.

## Quick Links

- **[User APIs](users.md)** - Authentication, registration, profile management
- **[Video APIs](videos.md)** - Video upload, retrieval, management
- **[Comment APIs](comments.md)** - Comment creation and management
- **[Like APIs](likes.md)** - Toggle likes on videos, comments, tweets
- **[Playlist APIs](playlists.md)** - Playlist creation and management
- **[Subscription APIs](subscriptions.md)** - Channel subscriptions
- **[Tweet APIs](tweets.md)** - Micro-posts management
- **[Dashboard APIs](dashboard.md)** - Channel statistics and videos
- **[Health Check API](healthcheck.md)** - Server health endpoint

## Base URL

```
http://localhost:8000/api/v1/
```

## Common Patterns

### Authentication

**Protected endpoints** require one of:
- Cookie: `Cookie: accessToken=<jwt_token>`
- Header: `Authorization: Bearer <jwt_token>`

**Examples:**
```bash
# Using cookie
curl -H "Cookie: accessToken=eyJhbGc..." http://localhost:8000/api/v1/users/current-user

# Using header
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:8000/api/v1/users/current-user
```

### Request Format

**JSON Request:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**File Upload (multipart/form-data):**
```
POST /api/v1/users/register
Content-Type: multipart/form-data

username=user123
email=user@example.com
password=secret123
avatar=<binary file>
coverImage=<binary file>
```

### Response Format

**Success (2xx):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "123",
    "name": "value"
  },
  "message": "Operation successful",
  "success": true
}
```

**Error (4xx/5xx):**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Validation error message",
  "success": false,
  "errors": []
}
```

### Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, POST, PATCH |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | No authentication token |
| 403 | Forbidden | Authorization check failed (not owner) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

### Query Parameters

#### Pagination
Used by list endpoints:
```
GET /api/v1/videos?page=2&limit=10
```

**Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page

**Response includes:**
- `totalDocs` - Total number of documents
- `totalPages` - Total number of pages
- `page` - Current page number
- `hasNextPage` - Whether next page exists
- `hasPrevPage` - Whether previous page exists

#### Sorting
Used by some list endpoints:
```
GET /api/v1/videos?sortBy=views&sortType=desc
```

**Parameters:**
- `sortBy` (string, default: "createdAt") - Field to sort by
- `sortType` (string: "asc" or "desc", default: "asc") - Sort direction

#### Search
Used by video listing:
```
GET /api/v1/videos?query=funny&userId=123
```

**Parameters:**
- `query` (string) - Search in title/description (case-insensitive)
- `userId` (ObjectId) - Filter by owner

## Endpoint Categories

### User Management (9 endpoints)
```
POST   /users/register                 - Register new user
POST   /users/login                    - Login user (protected by... none, public)
POST   /users/logout                   - Logout user [PROTECTED]
POST   /users/refresh-token            - Refresh access token
POST   /users/change-password          - Change password [PROTECTED]
GET    /users/current-user             - Get current user [PROTECTED]
PATCH  /users/update-account           - Update profile [PROTECTED]
PATCH  /users/avatar                   - Update avatar [PROTECTED]
PATCH  /users/cover-image              - Update cover image [PROTECTED]
GET    /users/c/:username              - Get channel profile [PROTECTED]
GET    /users/watch-history            - Get watch history [PROTECTED]
```

### Video Management (6 endpoints)
```
POST   /video/                         - Publish video [PROTECTED]
GET    /video/                         - Get all videos [PROTECTED]
GET    /video/:videoId                 - Get video by ID [PROTECTED]
PATCH  /video/:videoId                 - Update video [PROTECTED]
DELETE /video/:videoId                 - Delete video [PROTECTED]
PATCH  /video/toggle/publish/:videoId  - Toggle publish status [PROTECTED]
```

### Comments (4 endpoints)
```
POST   /comment/:videoId               - Add comment [PROTECTED]
GET    /comment/:videoId               - Get video comments [PROTECTED]
PATCH  /comment/c/:commentId           - Update comment [PROTECTED]
DELETE /comment/c/:commentId           - Delete comment [PROTECTED]
```

### Likes (4 endpoints)
```
POST   /like/toggle/v/:videoId         - Toggle video like [PROTECTED]
POST   /like/toggle/c/:commentId       - Toggle comment like [PROTECTED]
POST   /like/toggle/t/:tweetId         - Toggle tweet like [PROTECTED]
GET    /like/videos                    - Get liked videos [PROTECTED]
```

### Playlists (6 endpoints)
```
POST   /playlist/                      - Create playlist [PROTECTED]
GET    /playlist/:playlistId           - Get playlist [PROTECTED]
PATCH  /playlist/:playlistId           - Update playlist [PROTECTED]
DELETE /playlist/:playlistId           - Delete playlist [PROTECTED]
PATCH  /playlist/add/:videoId/:playlistId    - Add video to playlist [PROTECTED]
PATCH  /playlist/remove/:videoId/:playlistId - Remove video from playlist [PROTECTED]
GET    /playlist/user/:userId          - Get user playlists [PROTECTED]
```

### Subscriptions (3 endpoints)
```
POST   /subscription/c/:channelId      - Toggle subscription [PROTECTED]
GET    /subscription/c/:channelId      - Get channel subscribers [PROTECTED]
GET    /subscription/u/:subscriberId   - Get subscribed channels [PROTECTED]
```

### Tweets (4 endpoints)
```
POST   /tweet/                         - Create tweet [PROTECTED]
GET    /tweet/user/:userId             - Get user tweets [PROTECTED]
PATCH  /tweet/:tweetId                 - Update tweet [PROTECTED]
DELETE /tweet/:tweetId                 - Delete tweet [PROTECTED]
```

### Dashboard (2 endpoints)
```
GET    /dashboard/stats                - Get channel stats [PROTECTED]
GET    /dashboard/videos               - Get channel videos [PROTECTED]
```

### Health Check (1 endpoint)
```
GET    /healthcheck/                   - Server health check (PUBLIC)
```

## Common Response Fields

### User Object
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "avatar": "string (Cloudinary URL)",
  "coverImage": "string (Cloudinary URL)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Video Object
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "videoFile": "string (Cloudinary URL)",
  "thumbnail": "string (Cloudinary URL)",
  "duration": "number (seconds)",
  "views": "number",
  "isPublished": "boolean",
  "owner": {
    "_id": "ObjectId",
    "username": "string",
    "fullName": "string",
    "avatar": "string"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Comment Object
```json
{
  "_id": "ObjectId",
  "content": "string",
  "video": "ObjectId",
  "owner": {
    "_id": "ObjectId",
    "username": "string",
    "fullName": "string",
    "avatar": "string"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Like Object
```json
{
  "_id": "ObjectId",
  "video": "ObjectId (optional)",
  "comment": "ObjectId (optional)",
  "tweet": "ObjectId (optional)",
  "likedBy": "ObjectId (user ID)",
  "createdAt": "ISO date string"
}
```

### Playlist Object
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "videos": ["ObjectId"],
  "owner": "ObjectId",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Tweet Object
```json
{
  "_id": "ObjectId",
  "content": "string",
  "owner": {
    "_id": "ObjectId",
    "username": "string",
    "fullName": "string",
    "avatar": "string"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

## Error Handling

### Common Error Responses

**400 - Bad Request (Validation Error)**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "All fields are required",
  "success": false
}
```

**401 - Unauthorized (No Token)**
```json
{
  "statusCode": 401,
  "data": null,
  "message": "Unauthorized request",
  "success": false
}
```

**403 - Forbidden (Not Owner)**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to delete this video",
  "success": false
}
```

**404 - Not Found**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "Video not found",
  "success": false
}
```

**500 - Server Error**
```json
{
  "statusCode": 500,
  "data": null,
  "message": "Something went wrong while creating the video",
  "success": false
}
```

## Testing with Curl

### Register User
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "username=testuser" \
  -F "email=test@example.com" \
  -F "password=password123" \
  -F "fullName=Test User" \
  -F "avatar=@/path/to/avatar.jpg"
```

### Login User
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:8000/api/v1/users/current-user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Publish Video
```bash
curl -X POST http://localhost:8000/api/v1/video/ \
  -H "Authorization: Bearer <token>" \
  -F "title=My Video" \
  -F "description=A great video" \
  -F "videoFile=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

## Detailed Endpoint Documentation

For detailed information about each endpoint including:
- Request body schema
- Query parameters
- Response examples
- Error cases
- Frontend usage examples

Refer to individual feature documentation:
- [User APIs](users.md)
- [Video APIs](videos.md)
- [Comment APIs](comments.md)
- [Like APIs](likes.md)
- [Playlist APIs](playlists.md)
- [Subscription APIs](subscriptions.md)
- [Tweet APIs](tweets.md)
- [Dashboard APIs](dashboard.md)
- [Health Check API](healthcheck.md)

---

**Last Updated:** 2026-08-16
