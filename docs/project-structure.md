# Project Structure

## Directory Tree

```
Backend/
├── docs/                          # Documentation (created by this project)
│   ├── README.md                  # Main documentation index
│   ├── architecture.md            # System architecture & design
│   ├── project-structure.md       # This file
│   ├── tech-stack.md              # Technologies used
│   ├── authentication.md          # Auth/security documentation
│   ├── api/
│   │   ├── README.md              # API overview
│   │   ├── users.md               # User endpoints
│   │   ├── videos.md              # Video endpoints
│   │   ├── comments.md            # Comment endpoints
│   │   ├── likes.md               # Like endpoints
│   │   ├── playlists.md           # Playlist endpoints
│   │   ├── subscriptions.md       # Subscription endpoints
│   │   ├── tweets.md              # Tweet endpoints
│   │   ├── dashboard.md           # Dashboard endpoints
│   │   └── healthcheck.md         # Health check endpoint
│   ├── database/
│   │   ├── schema.md              # Database schema reference
│   │   └── relationships.md       # Data relationships
│   ├── features/
│   │   ├── README.md              # Feature documentation index
│   │   ├── authentication.md      # Auth feature
│   │   ├── video-management.md    # Video feature
│   │   ├── social-features.md     # Comments, likes, etc.
│   │   └── playlists.md           # Playlist feature
│   ├── development/
│   │   ├── setup.md               # Local development setup
│   │   ├── environment.md         # Environment variables
│   │   ├── testing.md             # Testing guide
│   │   └── troubleshooting.md     # Common issues
│   ├── copilot/
│   │   ├── project-context.md     # Copilot project context
│   │   └── coding-rules.md        # Coding guidelines
│   └── DOCUMENTATION-AUDIT.md     # Audit report
│
├── public/
│   └── temp/                      # Temporary file uploads (Multer)
│       # Files cleaned after Cloudinary upload
│
├── src/
│   ├── index.js                   # Entry point - server start
│   ├── app.js                     # Express app setup & routes
│   ├── constants.js               # Constants (DB_NAME = "videoTube")
│   │
│   ├── routes/                    # HTTP route definitions
│   │   ├── user.routes.js         # User endpoints (/api/v1/users)
│   │   ├── video.routes.js        # Video endpoints (/api/v1/video)
│   │   ├── comment.routes.js      # Comment endpoints (/api/v1/comment)
│   │   ├── like.routes.js         # Like endpoints (/api/v1/like)
│   │   ├── playlist.routes.js     # Playlist endpoints (/api/v1/playlist)
│   │   ├── subscription.routes.js # Subscription endpoints (/api/v1/subscription)
│   │   ├── tweet.routes.js        # Tweet endpoints (/api/v1/tweet)
│   │   ├── dashboard.routes.js    # Dashboard endpoints (/api/v1/dashboard)
│   │   └── healthcheck.routes.js  # Health check endpoint
│   │
│   ├── controllers/               # Business logic & request handlers
│   │   ├── user.controller.js     # User operations (register, login, profile)
│   │   ├── video.controller.js    # Video operations (CRUD, search, view count)
│   │   ├── comment.controller.js  # Comment operations (create, update, delete)
│   │   ├── like.controller.js     # Like operations (toggle on videos/comments/tweets)
│   │   ├── playlist.controller.js # Playlist operations (create, add/remove videos)
│   │   ├── subscription.controller.js # Subscription operations (toggle, get subscribers)
│   │   ├── tweet.controller.js    # Tweet operations (create, update, delete)
│   │   ├── dashboard.controller.js # Channel stats and videos
│   │   └── healthcheck.controller.js # Health check response
│   │
│   ├── models/                    # Mongoose schemas
│   │   ├── user.model.js          # User schema (username, email, password, etc.)
│   │   ├── video.model.js         # Video schema (title, description, owner, etc.)
│   │   ├── comment.model.js       # Comment schema (content, owner, video)
│   │   ├── like.model.js          # Like schema (video/comment/tweet, likedBy)
│   │   ├── playlist.model.js      # Playlist schema (name, videos array, owner)
│   │   ├── subscription.model.js  # Subscription schema (subscriber, channel)
│   │   └── tweet.model.js         # Tweet schema (content, owner)
│   │
│   ├── middlewares/               # Express middleware
│   │   ├── auth.middleware.js     # JWT verification (verifyJWT)
│   │   └── multer.middleware.js   # File upload handler (upload)
│   │
│   ├── utils/                     # Utility functions
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Response formatter class
│   │   ├── asyncHandler.js        # Async/await wrapper
│   │   └── cloudinary.js          # Cloudinary upload handler
│   │
│   └── db/
│       └── index.js               # MongoDB connection setup
│
├── .env                           # Environment variables (not in git)
├── .env.sample                    # INFERENCE - Sample env file (NOT VERIFIED)
├── .gitignore                     # Git ignore file
├── package.json                   # Project dependencies & scripts
├── package-lock.json              # Dependency lock file
└── README.md                      # Project README (existing)
```

## File Responsibilities

### Entry Point
- **`src/index.js`** - Server initialization
  - Loads .env variables
  - Connects to MongoDB
  - Starts Express server on port 8000

### Express Application
- **`src/app.js`** - Express app configuration
  - Sets up middleware (CORS, JSON parser, cookie parser)
  - Mounts all route modules
  - Handles static files from `public/`

### Route Layer (`src/routes/`)
Each file handles one feature area:

| File | Purpose | Endpoints |
|------|---------|-----------|
| `user.routes.js` | User auth & profile | /register, /login, /logout, /current-user, /avatar, etc. |
| `video.routes.js` | Video management | /, /:videoId, /toggle/publish/:videoId, etc. |
| `comment.routes.js` | Comment management | /:videoId (get/post), /c/:commentId (patch/delete) |
| `like.routes.js` | Like management | /toggle/v/:videoId, /toggle/c/:commentId, etc. |
| `playlist.routes.js` | Playlist management | /, /:playlistId, /add/:videoId/:playlistId, etc. |
| `subscription.routes.js` | Subscriptions | /c/:channelId (get/post), /u/:userId |
| `tweet.routes.js` | Tweet management | /, /user/:userId, /:tweetId |
| `dashboard.routes.js` | Analytics | /stats, /videos |
| `healthcheck.routes.js` | Server health | / |

### Controller Layer (`src/controllers/`)
Each file implements business logic for one feature:

| File | Primary Functions |
|------|------------------|
| `user.controller.js` | registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory |
| `video.controller.js` | getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus |
| `comment.controller.js` | getVideoComments, addComment, updateComment, deleteComment |
| `like.controller.js` | toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos |
| `playlist.controller.js` | createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, updatePlaylist, deletePlaylist |
| `subscription.controller.js` | toggleSubscription, getUserChannelSubscribers, getSubscribedChannels |
| `tweet.controller.js` | createTweet, getUserTweets, updateTweet, deleteTweet |
| `dashboard.controller.js` | getChannelStats, getChannelVideos |
| `healthcheck.controller.js` | healthcheck |

### Model Layer (`src/models/`)
Mongoose schema definitions:

| File | Schema | Key Fields |
|------|--------|-----------|
| `user.model.js` | User | username, email, password, avatar, coverImage, watchHistory, refreshToken |
| `video.model.js` | Video | title, description, videoFile, thumbnail, duration, views, owner, isPublished |
| `comment.model.js` | Comment | content, video, owner |
| `like.model.js` | Like | video, comment, tweet, likedBy |
| `playlist.model.js` | Playlist | name, description, videos[], owner |
| `subscription.model.js` | Subscription | subscriber, channel |
| `tweet.model.js` | Tweet | content, owner |

### Middleware (`src/middlewares/`)

| File | Middleware | Purpose |
|------|-----------|---------|
| `auth.middleware.js` | `verifyJWT` | JWT validation, user attachment |
| `multer.middleware.js` | `upload` | File upload handling (single, fields, array) |

### Utilities (`src/utils/`)

| File | Export | Purpose |
|------|--------|---------|
| `ApiError.js` | `ApiError` class | Standardized error handling |
| `ApiResponse.js` | `ApiResponse` class | Standardized response formatting |
| `asyncHandler.js` | `asyncHandler` function | Async wrapper for error catching |
| `cloudinary.js` | `uploadOnCloudinary` function | File upload to Cloudinary |

### Database (`src/db/`)

| File | Purpose |
|------|---------|
| `index.js` | MongoDB connection with Mongoose |

## Data Flow Through Layers

Example: "User publishes a video"

```
1. CLIENT
   POST /api/v1/video
   multipart/form-data: {title, description, videoFile, thumbnail}

2. MIDDLEWARE
   src/middlewares/multer.middleware.js
   • Stores files: public/temp/video.mp4, public/temp/thumb.jpg

3. MIDDLEWARE
   src/middlewares/auth.middleware.js (verifyJWT)
   • Validates token, attaches req.user

4. ROUTE
   src/routes/video.routes.js
   • Matches POST /api/v1/video
   • Calls publishAVideo controller

5. CONTROLLER
   src/controllers/video.controller.js → publishAVideo()
   • Validates input (title, description, files)
   • Calls utils/cloudinary.js → uploadOnCloudinary()

6. UTILITY
   src/utils/cloudinary.js
   • Uploads to Cloudinary
   • Returns: {url, duration, ...}
   • Deletes local temp files

7. MODEL
   src/models/video.model.js → Video.create()
   • Stores document in MongoDB:
     {videoFile: url, thumbnail: url, owner: user._id, ...}

8. RESPONSE UTILITY
   src/utils/ApiResponse.js
   • Formats response: {statusCode, data, message, success}

9. CLIENT
   Response: {video: {...}, statusCode: 201, success: true}
```

## Environment & Configuration

### `.env` File Location
- **File:** `/.env` (root directory)
- **Status:** Not tracked in git (add to .gitignore)
- **Variables:** See `docs/development/environment.md`

### Configuration Sources

| Source | Purpose | File |
|--------|---------|------|
| `.env` file | Runtime configuration | /.env |
| `constants.js` | Application constants | src/constants.js |
| `package.json` | Project metadata, scripts | package.json |

## Temporary Files

- **Location:** `public/temp/`
- **Purpose:** Multer stores uploads here temporarily
- **Cleanup:** Deleted after successful Cloudinary upload (see `src/utils/cloudinary.js`)
- **On Failure:** Deleted in error handling

## Static Files

- **Location:** `public/` directory
- **Served:** Automatically via `app.use(express.static("public"))`
- **Access:** `http://localhost:8000/` + relative path

## Database

- **Type:** MongoDB
- **Name:** `videoTube` (defined in `src/constants.js`)
- **Collections:** users, videos, comments, likes, playlists, subscriptions, tweets
- **Connection:** Via Mongoose in `src/db/index.js`

## Important Patterns

### Async/Await with Error Handling
```javascript
// Every controller uses asyncHandler wrapper
const handler = asyncHandler(async (req, res) => {
  // Async code here - errors caught automatically
});
```

### Request Validation
```javascript
// Controllers validate input at start
if (!input || input.trim() === "") {
  throw new ApiError(400, "Input is required");
}
```

### Authorization Check
```javascript
// Owner-only operations checked in controller
if (document.owner.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "Unauthorized");
}
```

### Aggregation Pipeline
```javascript
// Complex queries use MongoDB aggregation
const result = await Model.aggregate([
  { $match: {...} },
  { $lookup: {...} },
  { $sort: {...} },
  { $project: {...} }
]);
```

## Naming Conventions

### Files
- **Routes:** `featureName.routes.js` (e.g., `user.routes.js`)
- **Controllers:** `featureName.controller.js` (e.g., `user.controller.js`)
- **Models:** `featureName.model.js` (e.g., `user.model.js`)
- **Middleware:** `descriptive.middleware.js` (e.g., `auth.middleware.js`)
- **Utilities:** `descriptiveName.js` (e.g., `ApiError.js`)

### Functions
- **Controllers:** camelCase, action + resource (e.g., `createUser`, `deleteVideo`)
- **Middleware:** camelCase, descriptive (e.g., `verifyJWT`, `uploadFile`)
- **Utils:** camelCase, descriptive (e.g., `uploadOnCloudinary`)

### Variables
- **Database fields:** camelCase (e.g., `userName`, `coverImage`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DB_NAME`, `ACCESS_TOKEN_EXPIRY`)
- **Mongoose refs:** lowercase, singular (e.g., `ref: "User"`, `ref: "Video"`)

### Routes
- **Pattern:** `/api/v1/featureName/...`
- **Resource:** Singular or plural consistently (e.g., `/user`, `/video`)
- **Actions:** Verbs for non-CRUD (e.g., `/toggle/publish`, `/refresh-token`)
- **Parameters:** `:resourceId` (e.g., `:videoId`, `:userId`)

---

See also: [Architecture](architecture.md), [Tech Stack](tech-stack.md), [API Reference](api/README.md)
