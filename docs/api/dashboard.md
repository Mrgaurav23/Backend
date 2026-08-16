# Dashboard APIs

Complete documentation for channel dashboard and analytics endpoints.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/dashboard/stats` | GET | Yes | Get channel statistics |
| `/dashboard/videos` | GET | Yes | Get channel's published videos |

**All dashboard endpoints return data for the authenticated user's channel.**

## 1. Get Channel Statistics

Retrieves analytics for the authenticated user's channel.

**Endpoint:** `GET /api/v1/dashboard/stats`

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "totalSubscribers": 150,
    "totalVideos": 12,
    "totalVideoViews": 45000,
    "totalLikes": 2300
  },
  "message": "Channel statistics fetched successfully",
  "success": true
}
```

### Response - Zero Stats (200)

When a user has no videos or subscribers:

```json
{
  "statusCode": 200,
  "data": {
    "totalSubscribers": 0,
    "totalVideos": 0,
    "totalVideoViews": 0,
    "totalLikes": 0
  },
  "message": "Channel stats fetched successfully with zero counts",
  "success": true
}
```

### Business Logic

1. Get authenticated user's channel ID
2. Aggregation pipeline on Video collection:
   - Match videos with owner = channelId
   - Group all videos to calculate:
     - Total videos count
     - Total views (sum of all views)
     - Collect video IDs for like lookup
   - $lookup subscriptions to count subscribers
   - $lookup likes with video IDs to count total likes
   - Project final statistics

### Statistics Breakdown

- **totalSubscribers**: Number of users subscribed to this channel
- **totalVideos**: Number of videos published by this channel owner
- **totalVideoViews**: Sum of views across all channel videos
- **totalLikes**: Total likes received across all channel videos

---

## 2. Get Channel Videos

Retrieves all published videos from the authenticated user's channel (paginated).

**Endpoint:** `GET /api/v1/dashboard/videos`

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Videos per page |

### Request Example

```bash
curl "http://localhost:8000/api/v1/dashboard/videos?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "videos": [
      {
        "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
        "title": "Tutorial Video 1",
        "description": "Learn coding basics",
        "videoFile": "https://res.cloudinary.com/.../video1.mp4",
        "thumbnail": "https://res.cloudinary.com/.../thumb1.jpg",
        "duration": 720,
        "views": 5000,
        "isPublished": true,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "totalDocs": 12,
    "totalPages": 2,
    "page": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Channel videos fetched successfully",
  "success": true
}
```

### Business Logic

1. Get authenticated user's channel ID
2. Aggregation pipeline on Video collection:
   - Match videos with owner = channelId
   - Sort by createdAt descending (newest first)
   - Project selected fields
3. Apply pagination (using mongoose-aggregate-paginate)
4. Return videos with pagination metadata

### Sorting

- Videos sorted by **createdAt: -1** (newest published first)

### Fields Returned

- videoFile (Cloudinary URL)
- thumbnail (Cloudinary URL)
- title, description
- duration (seconds)
- views (view count)
- isPublished (boolean)
- createdAt, updatedAt

---

## Use Cases

### Dashboard Display

A channel owner would typically:

1. Call `/dashboard/stats` to display:
   - Subscriber count on channel header
   - Total video count
   - Total channel views
   - Total likes received

2. Call `/dashboard/videos` to display:
   - List of published videos
   - Thumbnail previews
   - View counts
   - Publication dates

### Analytics Implementation

```javascript
// Frontend example
const getDashboard = async (accessToken) => {
  // Get stats
  const statsResponse = await fetch('/api/v1/dashboard/stats', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const stats = await statsResponse.json();

  // Get videos
  const videosResponse = await fetch('/api/v1/dashboard/videos?page=1&limit=20', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const videos = await videosResponse.json();

  return {
    stats: stats.data,
    videos: videos.data.videos,
    pagination: {
      totalPages: videos.data.totalPages,
      currentPage: videos.data.page,
      hasNext: videos.data.hasNextPage
    }
  };
};
```

---

See also: [API Overview](README.md), [Video APIs](videos.md)
