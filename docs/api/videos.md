# Video APIs

Complete documentation for video management endpoints.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/video/` | POST | Yes | Publish a new video |
| `/video/` | GET | Yes | Get all videos (with search/filter) |
| `/video/:videoId` | GET | Yes | Get single video by ID |
| `/video/:videoId` | PATCH | Yes | Update video metadata |
| `/video/:videoId` | DELETE | Yes | Delete video |
| `/video/toggle/publish/:videoId` | PATCH | Yes | Toggle publish status |

## 1. Publish Video

Uploads and publishes a new video.

**Endpoint:** `POST /api/v1/video/`

**Authentication:** Yes

**Content-Type:** `multipart/form-data`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Video title |
| `description` | string | Yes | Video description |
| `videoFile` | file | Yes | Video file (uploaded to Cloudinary) |
| `thumbnail` | file | Yes | Thumbnail image (uploaded to Cloudinary) |

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/video/ \
  -H "Authorization: Bearer <token>" \
  -F "title=My Awesome Video" \
  -F "description=This is an awesome video about coding" \
  -F "videoFile=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

### Response - Success (201)

```json
{
  "statusCode": 201,
  "data": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "title": "My Awesome Video",
    "description": "This is an awesome video about coding",
    "videoFile": "https://res.cloudinary.com/.../video.mp4",
    "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
    "duration": 720,
    "views": 0,
    "isPublished": true,
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Video Published Successfully",
  "success": true
}
```

### Response - Error

**400 - Missing Fields**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "title & description in required",
  "success": false
}
```

**400 - Missing Files**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Videofile & thumbnail is required",
  "success": false
}
```

### Business Logic

1. Validate title and description are provided
2. Validate video file and thumbnail file are provided
3. Upload video file to Cloudinary (returns URL, duration, etc.)
4. Upload thumbnail to Cloudinary (returns URL)
5. Create Video document:
   - title, description
   - videoFile: Cloudinary video URL (secure_url)
   - thumbnail: Cloudinary thumbnail URL (secure_url)
   - duration: From Cloudinary response
   - owner: Authenticated user's _id
   - isPublished: true (default)
   - views: 0 (default)
6. Return video object

---

## 2. Get All Videos

Retrieves published videos with optional search, filter, and sorting.

**Endpoint:** `GET /api/v1/video/`

**Authentication:** Yes

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page |
| `query` | string | - | Search in title/description (case-insensitive) |
| `sortBy` | string | createdAt | Field to sort by (views, createdAt, etc.) |
| `sortType` | string | asc | Sort direction: asc or desc |
| `userId` | ObjectId | - | Filter by video owner |

### Request Example

```bash
# Get published videos with search
curl "http://localhost:8000/api/v1/video/?query=tutorial&sortBy=views&sortType=desc&page=1&limit=10" \
  -H "Authorization: Bearer <token>"

# Get videos by specific creator
curl "http://localhost:8000/api/v1/video/?userId=65a1b2c3d4e5f6g7h8i9j0k1&page=1" \
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
        "title": "Tutorial Video",
        "description": "Learn how to code",
        "videoFile": "https://res.cloudinary.com/.../video.mp4",
        "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
        "duration": 720,
        "views": 1500,
        "owner": {
          "username": "teacher",
          "fullName": "Teacher Name",
          "avatar": "https://res.cloudinary.com/.../avatar.jpg"
        },
        "createdAt": "2024-01-10T10:00:00.000Z"
      }
    ],
    "totalDocs": 150,
    "totalPages": 15,
    "page": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Videos fetched successfully",
  "success": true
}
```

### Filtering & Sorting

**Only published videos** are returned (isPublished: true)

**Search:** Case-insensitive regex on title and description

**Sort Options:**
- `createdAt` - Date created (default)
- `views` - Number of views
- `duration` - Video duration
- Other video fields

---

## 3. Get Video by ID

Retrieves a single video and increments view count.

**Endpoint:** `GET /api/v1/video/:videoId`

**Authentication:** Yes

**Parameters:**
- `:videoId` - Video ID

### Request Example

```bash
curl http://localhost:8000/api/v1/video/65b2c3d4e5f6g7h8i9j0k1l2 \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "title": "Tutorial Video",
    "description": "Learn how to code",
    "videoFile": "https://res.cloudinary.com/.../video.mp4",
    "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
    "duration": 720,
    "views": 1501,
    "isPublished": true,
    "owner": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "teacher",
      "fullName": "Teacher Name",
      "avatar": "https://res.cloudinary.com/.../avatar.jpg"
    },
    "createdAt": "2024-01-10T10:00:00.000Z"
  },
  "message": "Video fetched successfully",
  "success": true
}
```

### Response - Error

**400 - Invalid Video ID**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Invalid VideoId",
  "success": false
}
```

**404 - Video Not Found**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "Video not found or is not published",
  "success": false
}
```

### Business Logic

1. Validate videoId is valid ObjectId
2. Increment video views count by 1
3. Aggregation pipeline:
   - Match video by ID and isPublished: true
   - $lookup with User collection to get owner details
   - Flatten owner array
   - Project required fields
4. Return video object with incremented view count

---

## 4. Update Video

Updates video metadata (title, description, thumbnail).

**Endpoint:** `PATCH /api/v1/video/:videoId`

**Authentication:** Yes

**Content-Type:** `multipart/form-data` (for file) or `application/json`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | New video title |
| `description` | string | No | New video description |
| `thumbnail` | file | No | New thumbnail image |

**Note:** At least one field must be provided

### Request Example

```bash
curl -X PATCH http://localhost:8000/api/v1/video/65b2c3d4e5f6g7h8i9j0k1l2 \
  -H "Authorization: Bearer <token>" \
  -F "title=Updated Title" \
  -F "description=Updated description" \
  -F "thumbnail=@/path/to/new-thumbnail.jpg"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "title": "Updated Title",
    "description": "Updated description",
    "thumbnail": "https://res.cloudinary.com/.../new-thumbnail.jpg",
    "videoFile": "https://res.cloudinary.com/.../video.mp4",
    "duration": 720,
    "views": 1501,
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1"
  },
  "message": "Video is updated successfully",
  "success": true
}
```

### Response - Error

**403 - Not Owner**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to update this video",
  "success": false
}
```

**403 - No Update Fields**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "At least one field (title, description, or thumbnail) is required for update",
  "success": false
}
```

### Business Logic

1. Validate videoId
2. Find video and check ownership (owner === currentUser._id)
3. If not owner, return 403 error
4. Build update object with only provided fields
5. If thumbnail provided, upload to Cloudinary and add to update object
6. Update video document with $set operator
7. Return updated video

---

## 5. Delete Video

Deletes a video (owner only).

**Endpoint:** `DELETE /api/v1/video/:videoId`

**Authentication:** Yes

### Request Example

```bash
curl -X DELETE http://localhost:8000/api/v1/video/65b2c3d4e5f6g7h8i9j0k1l2 \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "title": "Video Title",
    "description": "Video description"
  },
  "message": "Delete Video Successfully",
  "success": true
}
```

### Response - Error

**403 - Not Owner**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to delete this video",
  "success": false
}
```

**404 - Video Not Found**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "Video not found",
  "success": false
}
```

### Business Logic

1. Validate videoId
2. Find video by ID
3. Check ownership (video.owner === currentUser._id)
4. Delete video document
5. Return deleted video object

**Note:** Cloudinary files are NOT automatically deleted. Would need separate cleanup job.

---

## 6. Toggle Publish Status

Toggles video between published and draft status.

**Endpoint:** `PATCH /api/v1/video/toggle/publish/:videoId`

**Authentication:** Yes

### Request Example

```bash
curl -X PATCH http://localhost:8000/api/v1/video/toggle/publish/65b2c3d4e5f6g7h8i9j0k1l2 \
  -H "Authorization: Bearer <token>"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "isPublished": false,
    "title": "Video Title"
  },
  "message": "Video publish status toggled successfully",
  "success": true
}
```

### Response - Error

**403 - Not Owner**
```json
{
  "statusCode": 403,
  "data": null,
  "message": "You are not authorized to update this video",
  "success": false
}
```

### Business Logic

1. Validate videoId
2. Find video by ID
3. Check ownership
4. Toggle isPublished: `!currentValue`
5. Save and return updated video

---

## Video Object Structure

```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "videoFile": "string (Cloudinary URL)",
  "thumbnail": "string (Cloudinary URL)",
  "duration": "number (seconds)",
  "views": "number (incremented on each view)",
  "isPublished": "boolean (default: true)",
  "owner": "ObjectId (User._id) or {_id, username, fullName, avatar}",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

---

## Frontend Integration Example

```javascript
// Upload video
const uploadVideo = async (videoData) => {
  const formData = new FormData();
  formData.append('title', videoData.title);
  formData.append('description', videoData.description);
  formData.append('videoFile', videoData.videoFile);
  formData.append('thumbnail', videoData.thumbnail);

  const response = await fetch('/api/v1/video/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });

  return response.json();
};

// Get single video (increments views)
const getVideo = async (videoId) => {
  const response = await fetch(`/api/v1/video/${videoId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return response.json();
};

// Search and filter
const searchVideos = async (query, sortBy = 'views', sortType = 'desc') => {
  const params = new URLSearchParams({
    query,
    sortBy,
    sortType,
    page: 1,
    limit: 20
  });

  const response = await fetch(`/api/v1/video/?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return response.json();
};
```

---

See also: [API Overview](README.md), [Dashboard APIs](dashboard.md)
