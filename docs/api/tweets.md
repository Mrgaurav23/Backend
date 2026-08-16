# Tweet APIs

Complete documentation for tweet management endpoints.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/tweet/` | POST | Yes | Create a tweet |
| `/tweet/user/:userId` | GET | Yes | Get user's tweets |
| `/tweet/:tweetId` | PATCH | Yes | Update tweet |
| `/tweet/:tweetId` | DELETE | Yes | Delete tweet |

## 1. Create Tweet

Creates a new tweet (micro-post).

**Endpoint:** `POST /api/v1/tweet/`

### Request Body

```json
{
  "content": "This is my first tweet! #awesome"
}
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65e5f6g7h8i9j0k1l2m3n4o5",
    "content": "This is my first tweet! #awesome",
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T16:00:00.000Z"
  },
  "message": "Tweet is uploaded successfully",
  "success": true
}
```

### Response - Error

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

## 2. Get User Tweets

Retrieves all tweets from a specific user.

**Endpoint:** `GET /api/v1/tweet/user/:userId`

**Parameters:** `:userId` - User ID to fetch tweets from

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "65e5f6g7h8i9j0k1l2m3n4o5",
      "content": "Tweet content",
      "owner": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "username": "user123",
        "fullName": "User Name",
        "avatar": "https://res.cloudinary.com/.../avatar.jpg"
      },
      "createdAt": "2024-01-15T16:00:00.000Z",
      "likesCount": 5,
      "isLiked": false
    }
  ],
  "message": "User tweets fetched successfully",
  "success": true
}
```

**Features:**
- Sorted by createdAt descending (newest first)
- Includes like count
- Includes isLiked flag (whether current user liked it)
- Populates owner details

---

## 3. Update Tweet

Updates tweet content (owner only).

**Endpoint:** `PATCH /api/v1/tweet/:tweetId`

**Parameters:** `:tweetId` - Tweet ID

### Request Body

```json
{
  "content": "Updated tweet content"
}
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65e5f6g7h8i9j0k1l2m3n4o5",
    "content": "Updated tweet content",
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1"
  },
  "message": "Tweet updated Successfully",
  "success": true
}
```

### Response - Error

**403 - Not Owner**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to update this tweet",
  "success": false
}
```

---

## 4. Delete Tweet

Deletes a tweet (owner only).

**Endpoint:** `DELETE /api/v1/tweet/:tweetId`

**Parameters:** `:tweetId` - Tweet ID

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65e5f6g7h8i9j0k1l2m3n4o5",
    "content": "Deleted tweet"
  },
  "message": "Tweet deleted successfully",
  "success": true
}
```

### Response - Error

**403 - Not Owner**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to delete this tweet",
  "success": false
}
```

---

## Tweet Object

```json
{
  "_id": "ObjectId",
  "content": "string",
  "owner": "ObjectId (User._id) or {username, fullName, avatar}",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

**With aggregation (in GET):**
```json
{
  "_id": "ObjectId",
  "content": "string",
  "owner": {username, fullName, avatar},
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string",
  "likesCount": "number",
  "isLiked": "boolean"
}
```

---

See also: [API Overview](README.md), [Like APIs](likes.md)
