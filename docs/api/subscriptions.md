# Subscription APIs

Complete documentation for channel subscription endpoints.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/subscription/c/:channelId` | POST | Yes | Toggle subscription to channel |
| `/subscription/c/:channelId` | GET | Yes | Get channel subscribers |
| `/subscription/u/:subscriberId` | GET | Yes | Get subscribed channels |

## 1. Toggle Subscription

Subscribes or unsubscribes from a channel.

**Endpoint:** `POST /api/v1/subscription/c/:channelId`

**Parameters:** `:channelId` - Channel user to subscribe/unsubscribe from

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/subscription/c/65a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

**If subscribed:**
```json
{
  "statusCode": 200,
  "data": {
    "subscribed": true
  },
  "message": "Subscribed successfully",
  "success": true
}
```

**If unsubscribed:**
```json
{
  "statusCode": 200,
  "data": {
    "subscribed": false
  },
  "message": "Unsubscribed successfully",
  "success": true
}
```

### Response - Error

**400 - Can't Subscribe to Self**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "You cannot subscribe/unsubscribe to your own channel",
  "success": false
}
```

**404 - Channel Not Found**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "Channel not found",
  "success": false
}
```

### Business Logic

1. Validate channel exists
2. Prevent self-subscription
3. Query for existing subscription: `{subscriber: userId, channel: channelId}`
4. If exists: Delete subscription (unsubscribe)
5. If not exists: Create subscription (subscribe)
6. Return subscription status

---

## 2. Get Channel Subscribers

Lists all subscribers to a channel.

**Endpoint:** `GET /api/v1/subscription/c/:channelId`

**Parameters:** `:channelId` - Channel ID

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "65e5f6g7h8i9j0k1l2m3n4o5",
      "subscriber": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
        "username": "subscriber1",
        "avatar": "https://res.cloudinary.com/.../avatar.jpg"
      },
      "channel": "65a1b2c3d4e5f6g7h8i9j0k2",
      "createdAt": "2024-01-14T10:00:00.000Z"
    }
  ],
  "message": "ChannelSubscriber Fetched SuccessFully",
  "success": true
}
```

---

## 3. Get Subscribed Channels

Lists all channels subscribed to by a user.

**Endpoint:** `GET /api/v1/subscription/u/:subscriberId`

**Parameters:** `:subscriberId` - User ID

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": [
    {
      "channel": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "username": "channelowner",
        "fullName": "Channel Owner",
        "avatar": "https://res.cloudinary.com/.../avatar.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "subscribedAt": "2024-01-14T10:00:00.000Z"
    }
  ],
  "message": "Subscriber details fetched successfully",
  "success": true
}
```

---

## Subscription Object

```json
{
  "_id": "ObjectId",
  "subscriber": "ObjectId (User._id) or {username, avatar}",
  "channel": "ObjectId (User._id) or {username, fullName, avatar}",
  "createdAt": "ISO date string"
}
```

---

See also: [API Overview](README.md), [User APIs](users.md)
