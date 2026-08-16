# Playlist APIs

Complete documentation for playlist management endpoints.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/playlist/` | POST | Yes | Create new playlist |
| `/playlist/:playlistId` | GET | Yes | Get playlist details |
| `/playlist/:playlistId` | PATCH | Yes | Update playlist info |
| `/playlist/:playlistId` | DELETE | Yes | Delete playlist |
| `/playlist/add/:videoId/:playlistId` | PATCH | Yes | Add video to playlist |
| `/playlist/remove/:videoId/:playlistId` | PATCH | Yes | Remove video from playlist |
| `/playlist/user/:userId` | GET | Yes | Get user's playlists |

## 1. Create Playlist

Creates a new playlist.

**Endpoint:** `POST /api/v1/playlist/`

### Request Body

```json
{
  "name": "My Favorite Videos",
  "description": "Collection of my favorite tutorial videos"
}
```

### Response - Success (201)

```json
{
  "statusCode": 201,
  "data": {
    "_id": "65d4e5f6g7h8i9j0k1l2m3n4",
    "name": "My Favorite Videos",
    "description": "Collection of my favorite tutorial videos",
    "videos": [],
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T15:00:00.000Z"
  },
  "message": "Playlist created successfully",
  "success": true
}
```

---

## 2. Get Playlist

Retrieves playlist with all its videos and metadata.

**Endpoint:** `GET /api/v1/playlist/:playlistId`

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65d4e5f6g7h8i9j0k1l2m3n4",
    "name": "My Favorite Videos",
    "description": "Collection of tutorials",
    "videos": [
      {
        "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
        "videoFile": "https://res.cloudinary.com/.../video.mp4",
        "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
        "title": "Video Title",
        "duration": 720,
        "views": 1500
      }
    ],
    "owner": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "user123",
      "fullName": "User Name",
      "avatar": "https://res.cloudinary.com/.../avatar.jpg"
    },
    "totalVideos": 1,
    "totalViews": 1500,
    "createdAt": "2024-01-15T15:00:00.000Z"
  },
  "message": "Playlist fetched Successfully",
  "success": true
}
```

---

## 3. Update Playlist

Updates playlist name and description.

**Endpoint:** `PATCH /api/v1/playlist/:playlistId`

### Request Body

```json
{
  "name": "Updated Playlist Name",
  "description": "Updated description"
}
```

### Response - Success (200)

Similar to Create response with updated fields.

---

## 4. Delete Playlist

Deletes a playlist (owner only).

**Endpoint:** `DELETE /api/v1/playlist/:playlistId`

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65d4e5f6g7h8i9j0k1l2m3n4",
    "name": "Deleted Playlist"
  },
  "message": "Playlist deleted successfully",
  "success": true
}
```

---

## 5. Add Video to Playlist

Adds a video to a playlist (no duplicates via $addToSet).

**Endpoint:** `PATCH /api/v1/playlist/add/:videoId/:playlistId`

**Parameters:**
- `:videoId` - Video to add
- `:playlistId` - Target playlist

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65d4e5f6g7h8i9j0k1l2m3n4",
    "videos": ["65b2c3d4e5f6g7h8i9j0k1l2", "65b2c3d4e5f6g7h8i9j0k1l3"]
  },
  "message": "Video added to playlist successfully",
  "success": true
}
```

### Authorization

- Must be playlist owner
- Returns 403 if not owner

---

## 6. Remove Video from Playlist

Removes a video from a playlist.

**Endpoint:** `PATCH /api/v1/playlist/remove/:videoId/:playlistId`

**Parameters:**
- `:videoId` - Video to remove
- `:playlistId` - Target playlist

### Response - Success (200)

Similar to Add response with updated videos array.

---

## 7. Get User Playlists

Retrieves all playlists owned by a user.

**Endpoint:** `GET /api/v1/playlist/user/:userId`

**Parameters:**
- `:userId` - User ID to fetch playlists for

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "65d4e5f6g7h8i9j0k1l2m3n4",
      "name": "Playlist 1",
      "description": "First playlist",
      "createdAt": "2024-01-15T15:00:00.000Z",
      "totalVideos": 5,
      "totalViews": 7500,
      "firstVideoThumbnail": "https://res.cloudinary.com/.../thumbnail.jpg"
    }
  ],
  "message": "User Playlists fetched Successfully",
  "success": true
}
```

**Note:** Only published videos are counted in totalVideos and totalViews.

---

## Playlist Object

```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "videos": ["ObjectId (Video._id)"],
  "owner": "ObjectId (User._id) or {username, fullName, avatar}",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

---

See also: [API Overview](README.md), [Video APIs](videos.md)
