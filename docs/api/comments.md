# Comment APIs

Complete documentation for comment management endpoints.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/comment/:videoId` | GET | Yes | Get comments for a video |
| `/comment/:videoId` | POST | Yes | Add comment to video |
| `/comment/c/:commentId` | PATCH | Yes | Update comment (owner only) |
| `/comment/c/:commentId` | DELETE | Yes | Delete comment (owner only) |

**All comment endpoints are protected. All comments are associated with a video.**

## 1. Get Video Comments

Retrieves paginated comments for a specific video.

**Endpoint:** `GET /api/v1/comment/:videoId`

**Parameters:** `page`, `limit` (query), `:videoId` (path)

### Request Example

```bash
curl "http://localhost:8000/api/v1/comment/65b2c3d4e5f6g7h8i9j0k1l2?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "comments": [
      {
        "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
        "content": "Great video!",
        "owner": {
          "username": "user123",
          "fullName": "User Name",
          "avatar": "https://res.cloudinary.com/.../avatar.jpg"
        },
        "createdAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "totalDocs": 45,
    "totalPages": 5,
    "page": 1,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Video comments fetched successfully",
  "success": true
}
```

### Sorting
- Comments sorted by `createdAt: -1` (newest first)

---

## 2. Add Comment

Adds a comment to a video.

**Endpoint:** `POST /api/v1/comment/:videoId`

**Parameters:** `:videoId` (path)

### Request Body

```json
{
  "content": "Great video! Thanks for sharing!"
}
```

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/comment/65b2c3d4e5f6g7h8i9j0k1l2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great video!"}'
```

### Response - Success (201)

```json
{
  "statusCode": 201,
  "data": {
    "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
    "content": "Great video!",
    "video": "65b2c3d4e5f6g7h8i9j0k1l2",
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T14:35:00.000Z"
  },
  "message": "Comment Created Successfully",
  "success": true
}
```

### Response - Error

**400 - Invalid VideoId**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Invalid videoId",
  "success": false
}
```

**400 - Missing Content**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Content is required",
  "success": false
}
```

---

## 3. Update Comment

Updates a comment (owner only).

**Endpoint:** `PATCH /api/v1/comment/c/:commentId`

**Parameters:** `:commentId` (path)

### Request Body

```json
{
  "content": "Updated comment text"
}
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
    "content": "Updated comment text",
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
    "video": "65b2c3d4e5f6g7h8i9j0k1l2"
  },
  "message": "Comment updated successfully",
  "success": true
}
```

### Response - Error

**403 - Not Owner**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to update this comment",
  "success": false
}
```

---

## 4. Delete Comment

Deletes a comment (owner only).

**Endpoint:** `DELETE /api/v1/comment/c/:commentId`

**Parameters:** `:commentId` (path)

### Request Example

```bash
curl -X DELETE http://localhost:8000/api/v1/comment/c/65c3d4e5f6g7h8i9j0k1l2m3 \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
    "content": "Comment text"
  },
  "message": "Comment deleted successfully",
  "success": true
}
```

### Response - Error

**403 - Not Owner**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to delete this comment",
  "success": false
}
```

---

## Comment Object

```json
{
  "_id": "ObjectId",
  "content": "string",
  "video": "ObjectId (Video._id)",
  "owner": "ObjectId (User._id) or {username, fullName, avatar}",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

---

See also: [API Overview](README.md), [Like APIs](likes.md)
