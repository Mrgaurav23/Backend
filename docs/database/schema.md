# Database Schema

Complete MongoDB database schema documentation for VideoTube.

**Database Name:** `videoTube` (defined in `src/constants.js`)

**Connection:** Via Mongoose in `src/db/index.js`

**URI:** `${MONGODB_URI}/videoTube` from environment variable

---

## Collections Overview

| Collection | Purpose | Documents | Relationships |
|-----------|---------|-----------|-----------------|
| `users` | User accounts and profiles | One per user | Referenced by videos, comments, playlists, etc. |
| `videos` | Video content | One per video upload | Owned by user, commented on, liked, in playlists |
| `comments` | Video comments | One per comment | Belongs to video and user |
| `likes` | Likes/reactions | One per like action | References video, comment, or tweet |
| `playlists` | Video collections | One per playlist | Owned by user, contains videos |
| `subscriptions` | Channel subscriptions | One per subscription | References subscriber and channel (both users) |
| `tweets` | Micro-posts | One per tweet | Authored by user |

---

## 1. Users Collection

Stores user account information and authentication data.

### Schema Definition

| Field | Type | Required | Unique | Index | Notes |
|-------|------|----------|--------|-------|-------|
| `_id` | ObjectId | Auto | - | Yes | Primary key (auto-generated) |
| `username` | String | Yes | Yes | Yes | Lowercase, trimmed, must be unique |
| `email` | String | Yes | Yes | - | Lowercase, trimmed, must be unique |
| `fullName` | String | Yes | - | Yes | Display name, indexed for searching |
| `password` | String | Yes | - | - | Hashed with bcrypt (10 salt rounds) |
| `avatar` | String | Yes | - | - | Cloudinary URL, required for registration |
| `coverImage` | String | No | - | - | Cloudinary URL, optional |
| `watchHistory` | [ObjectId] | - | - | - | Array of video IDs watched by user |
| `refreshToken` | String | No | - | - | JWT refresh token, cleared on logout |
| `createdAt` | Date | Auto | - | - | Timestamp of account creation |
| `updatedAt` | Date | Auto | - | - | Timestamp of last update |

### Indexes

- `username` - Unique, used for login and profile retrieval
- `email` - Unique, used for login
- `fullName` - Used for display and searching

### Validation

- `username`: Required, non-empty, converted to lowercase
- `email`: Required, non-empty, converted to lowercase
- `fullName`: Required, non-empty
- `password`: Required, hashed via pre-save hook
- `avatar`: Required, must be valid Cloudinary URL after upload

### Pre-save Hook

```javascript
// Hash password before saving if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### Instance Methods

- `isPasswordCorrect(password)` - Compare plain password with hashed (bcrypt)
- `genrateAccessToken()` - Generate JWT access token (15m expiry)
- `genrateRefreshToken()` - Generate JWT refresh token (7d expiry)

### Example Document

```json
{
  "_id": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "avatar": "https://res.cloudinary.com/demo/image/upload/v1234567890/avatar.jpg",
  "coverImage": "https://res.cloudinary.com/demo/image/upload/v1234567890/cover.jpg",
  "watchHistory": [
    ObjectId("65b2c3d4e5f6g7h8i9j0k1l2"),
    ObjectId("65b2c3d4e5f6g7h8i9j0k1l3")
  ],
  "password": "$2b$10$...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T14:30:00.000Z")
}
```

---

## 2. Videos Collection

Stores video content and metadata.

### Schema Definition

| Field | Type | Required | Default | Index | Notes |
|-------|------|----------|---------|-------|-------|
| `_id` | ObjectId | Auto | - | Yes | Primary key |
| `title` | String | Yes | - | - | Video title |
| `description` | String | Yes | - | - | Video description |
| `videoFile` | String | Yes | - | - | Cloudinary video URL (secure_url) |
| `thumbnail` | String | Yes | - | - | Cloudinary thumbnail URL (secure_url) |
| `duration` | Number | Yes | - | - | Video duration in seconds (from Cloudinary) |
| `views` | Number | - | 0 | - | View counter (incremented on each view) |
| `isPublished` | Boolean | - | true | - | Published or draft status |
| `owner` | ObjectId | Yes | - | - | Reference to User (_id) |
| `createdAt` | Date | Auto | - | - | Timestamp |
| `updatedAt` | Date | Auto | - | - | Timestamp |

### Relationships

- **owner** (1:N) → `users._id` - The user who uploaded the video
- **videos → comments** - Inverse relationship via `Comment.video`
- **videos → likes** - Inverse relationship via `Like.video`
- **videos → playlists** - Inverse relationship via `Playlist.videos` array

### Plugins

- `mongoose-aggregate-paginate-v2` - Enables pagination in aggregation pipelines

### Example Document

```json
{
  "_id": ObjectId("65b2c3d4e5f6g7h8i9j0k1l2"),
  "title": "Learn JavaScript Basics",
  "description": "Complete guide to JavaScript fundamentals",
  "videoFile": "https://res.cloudinary.com/.../video_xyz.mp4",
  "thumbnail": "https://res.cloudinary.com/.../thumb_xyz.jpg",
  "duration": 1200,
  "views": 5000,
  "isPublished": true,
  "owner": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "createdAt": ISODate("2024-01-10T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T14:30:00.000Z")
}
```

---

## 3. Comments Collection

Stores comments on videos.

### Schema Definition

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | Primary key |
| `content` | String | Yes | Comment text |
| `video` | ObjectId | - | Reference to Video (_id) |
| `owner` | ObjectId | - | Reference to User (_id) who created comment |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

### Relationships

- **video** (N:1) → `videos._id` - The video being commented on
- **owner** (N:1) → `users._id` - The user who wrote the comment

### Plugins

- `mongoose-aggregate-paginate-v2` - For paginated comment listing

### Constraints

- Comments can only be deleted/updated by their owner
- Comments are associated with published videos

### Example Document

```json
{
  "_id": ObjectId("65c3d4e5f6g7h8i9j0k1l2m3"),
  "content": "Great video! Very helpful for beginners.",
  "video": ObjectId("65b2c3d4e5f6g7h8i9j0k1l2"),
  "owner": ObjectId("65a1b2c3d4e5f6g7h8i9j0k2"),
  "createdAt": ISODate("2024-01-14T15:00:00.000Z"),
  "updatedAt": ISODate("2024-01-14T15:00:00.000Z")
}
```

---

## 4. Likes Collection

Stores likes/reactions on videos, comments, and tweets.

### Schema Definition

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | Primary key |
| `video` | ObjectId | No | Reference to Video (mutually exclusive) |
| `comment` | ObjectId | No | Reference to Comment (mutually exclusive) |
| `tweet` | ObjectId | No | Reference to Tweet (mutually exclusive) |
| `likedBy` | ObjectId | Yes | Reference to User (_id) who liked |
| `createdAt` | Date | Auto | Timestamp |

### Relationships

- **video/comment/tweet** → Exactly one must be populated
- **likedBy** (N:1) → `users._id` - The user who gave the like

### Business Logic

- Exactly one of `video`, `comment`, or `tweet` should be populated
- Toggling a like deletes the Like document if it exists, creates it if not
- Like counts calculated via aggregation (not stored redundantly)

### Example Documents

**Video Like:**
```json
{
  "_id": ObjectId("65d4e5f6g7h8i9j0k1l2m3n4"),
  "video": ObjectId("65b2c3d4e5f6g7h8i9j0k1l2"),
  "likedBy": ObjectId("65a1b2c3d4e5f6g7h8i9j0k3"),
  "createdAt": ISODate("2024-01-14T16:00:00.000Z")
}
```

**Comment Like:**
```json
{
  "_id": ObjectId("65d4e5f6g7h8i9j0k1l2m3n5"),
  "comment": ObjectId("65c3d4e5f6g7h8i9j0k1l2m3"),
  "likedBy": ObjectId("65a1b2c3d4e5f6g7h8i9j0k3"),
  "createdAt": ISODate("2024-01-14T16:00:00.000Z")
}
```

---

## 5. Playlists Collection

Stores user-created playlists of videos.

### Schema Definition

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Playlist name |
| `description` | String | Yes | Playlist description |
| `video` | ObjectId | - | INFERENCE - Schema shows single video, but used as array in practice |
| `owner` | ObjectId | Yes | Reference to User (_id) |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

### DISCREPANCY NOTED

The schema definition shows `video` as a single ObjectId, but the controller code treats it as an array (`videos` array, using `$addToSet` and `$pull`). This is a schema definition issue - the actual implementation appears to use an array structure.

**Likely correct schema:**
```javascript
videos: [
  {
    type: Schema.Types.ObjectId,
    ref: "Video"
  }
]
```

### Relationships

- **owner** (1:N) → `users._id` - The user who created the playlist
- **videos** (N:M) → `videos._id` - Array of videos in the playlist

### Business Logic

- Playlists can be modified only by their owner
- Videos added with `$addToSet` (prevents duplicates)
- Videos removed with `$pull`
- Only published videos are returned in retrieval

### Example Document

```json
{
  "_id": ObjectId("65d4e5f6g7h8i9j0k1l2m3n4"),
  "name": "My Favorite Tutorials",
  "description": "Collection of my top JavaScript tutorials",
  "videos": [
    ObjectId("65b2c3d4e5f6g7h8i9j0k1l2"),
    ObjectId("65b2c3d4e5f6g7h8i9j0k1l3"),
    ObjectId("65b2c3d4e5f6g7h8i9j0k1l4")
  ],
  "owner": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "createdAt": ISODate("2024-01-15T15:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T16:00:00.000Z")
}
```

---

## 6. Subscriptions Collection

Stores channel subscription relationships.

### Schema Definition

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | Primary key |
| `subscriber` | ObjectId | Yes | Reference to User (_id) who is subscribing |
| `channel` | ObjectId | Yes | Reference to User (_id) being subscribed to |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

### Relationships

- **subscriber** (N:1) → `users._id` - The user subscribing
- **channel** (N:1) → `users._id` - The channel owner (also a User)

### Business Logic

- Both subscriber and channel are users (same User collection)
- Users cannot subscribe to their own channel (validation in controller)
- Toggling subscription creates or deletes this document

### Example Document

```json
{
  "_id": ObjectId("65e5f6g7h8i9j0k1l2m3n4o5"),
  "subscriber": ObjectId("65a1b2c3d4e5f6g7h8i9j0k3"),
  "channel": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "createdAt": ISODate("2024-01-14T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-14T10:00:00.000Z")
}
```

---

## 7. Tweets Collection

Stores short-form text posts (tweets).

### Schema Definition

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | Primary key |
| `content` | String | Yes | Tweet content |
| `owner` | ObjectId | Yes | Reference to User (_id) |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

### Relationships

- **owner** (N:1) → `users._id` - The user who posted the tweet
- **tweets → likes** - Inverse relationship via `Like.tweet`

### Example Document

```json
{
  "_id": ObjectId("65e5f6g7h8i9j0k1l2m3n4o6"),
  "content": "Just finished learning React! #webdev #coding",
  "owner": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "createdAt": ISODate("2024-01-15T16:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T16:00:00.000Z")
}
```

---

## Indexes & Performance

### Indexed Fields

- `users.username` - Fast lookup for registration/login
- `users.email` - Fast lookup for registration/login
- `users.fullName` - Fast lookup for search/display
- Other fields implicitly indexed: all `_id` fields

### Aggregation Pipeline Optimization

Controllers use MongoDB aggregation pipelines for:
- **$match** - Filter documents
- **$lookup** - Join collections
- **$sort** - Order results
- **$project** - Select fields
- **$group** - Aggregate data
- **$addFields** - Add computed fields

This moves processing to the database, reducing data transfer.

### Query Performance Considerations

- Pagination with `mongoose-aggregate-paginate-v2` prevents loading entire collections
- Aggregation pipelines filter and join server-side
- `select("-password -refreshToken")` avoids sending sensitive data

---

## Data Relationships Diagram

```
┌─────────────────────────────────────────────────────┐
│                    users                            │
│  _id, username, email, fullName, password,          │
│  avatar, coverImage, watchHistory, refreshToken     │
└────────────────┬──────────────────────────────────┬─┘
                 │                                  │
        (owner)  │                      (subscriber)│
                 ↓                                  ↓
           ┌─────────────┐          ┌─────────────────────┐
           │   videos    │          │  subscriptions      │
           │ owner→user  │          │ subscriber→user     │
           │             │          │ channel→user        │
           └─────┬───────┘          └─────────────────────┘
                 │
    (video)      │ (video)              (owner)
                 ↓ │                       │
           ┌──────────────┐               │
           │   comments   │◄──────────────┴───────────┐
           │ video→video  │                (owner)    │
           │ owner→user   │                           │
           └──┬───────────┘                    ┌──────────────┐
              │ (comment)                       │   tweets     │
              │                                 │ owner→user   │
              ↓                                 └──┬───────────┘
         ┌──────────────┐                        │ (tweet)
         │    likes     │◄───────────────────────┘
         │ video→video  │
         │ comment→comment
         │ tweet→tweet
         │ likedBy→user
         └──────────────┘

         ┌──────────────┐
         │  playlists   │
         │ owner→user   │
         │ videos[]→video (array)
         └──────────────┘
```

---

## Timestamps

All collections include:
- **createdAt** - Automatically set on document creation
- **updatedAt** - Automatically updated on modifications

Managed by Mongoose's `timestamps: true` option in schemas.

---

See also: [Architecture](architecture.md), [API Reference](api/README.md)
