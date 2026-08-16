# Like APIs

Complete documentation for like management endpoints.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/like/toggle/v/:videoId` | POST | Yes | Toggle like on video |
| `/like/toggle/c/:commentId` | POST | Yes | Toggle like on comment |
| `/like/toggle/t/:tweetId` | POST | Yes | Toggle like on tweet |
| `/like/videos` | GET | Yes | Get all videos liked by user |

## 1. Toggle Video Like

Toggles like on a video (adds or removes).

**Endpoint:** `POST /api/v1/like/toggle/v/:videoId`

**Parameters:** `:videoId` (path)

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/like/toggle/v/65b2c3d4e5f6g7h8i9j0k1l2 \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

**If liked:**
```json
{
  "statusCode": 200,
  "data": {
    "likeCount": 42
  },
  "message": "Video Liked Successfully",
  "success": true
}
```

**If unliked:**
```json
{
  "statusCode": 200,
  "data": {
    "likeCount": 41
  },
  "message": "Video unLiked Successfully",
  "success": true
}
```

### Business Logic

1. Query for existing Like document: `{video: videoId, likedBy: userId}`
2. If exists: Delete the Like (unlike)
3. If not exists: Create new Like document (like)
4. Count total likes for the video
5. Return like count and action performed

---

## 2. Toggle Comment Like

Toggles like on a comment.

**Endpoint:** `POST /api/v1/like/toggle/c/:commentId`

**Parameters:** `:commentId` (path)

### Response Example

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Comment Liked successfully",
  "success": true
}
```

---

## 3. Toggle Tweet Like

Toggles like on a tweet.

**Endpoint:** `POST /api/v1/like/toggle/t/:tweetId`

**Parameters:** `:tweetId` (path)

### Response Example

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Tweet Liked successfully",
  "success": true
}
```

---

## 4. Get Liked Videos

Retrieves all videos liked by the authenticated user.

**Endpoint:** `GET /api/v1/like/videos`

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
      "video": "65b2c3d4e5f6g7h8i9j0k1l2",
      "likedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
      "createdAt": "2024-01-14T10:00:00.000Z"
    }
  ],
  "message": "Liked videos fetched successfully",
  "success": true
}
```

**Note:** Returns Like documents with video references. Frontend typically needs to populate video details separately or use aggregation.

---

## Like Object

```json
{
  "_id": "ObjectId",
  "video": "ObjectId (optional)",
  "comment": "ObjectId (optional)",
  "tweet": "ObjectId (optional)",
  "likedBy": "ObjectId (User._id)",
  "createdAt": "ISO date string"
}
```

**Constraint:** A Like document must have exactly one of: video, comment, or tweet

---

See also: [API Overview](README.md), [Comment APIs](comments.md), [Tweet APIs](tweets.md)
