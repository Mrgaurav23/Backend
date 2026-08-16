# User APIs

Complete documentation for user-related endpoints: authentication, registration, profile management.

## Overview

| Endpoint | Method | Authentication | Purpose |
|----------|--------|-----------------|---------|
| `/users/register` | POST | No | Register new user |
| `/users/login` | POST | No | Login user, receive tokens |
| `/users/logout` | POST | Yes | Logout user, clear tokens |
| `/users/refresh-token` | POST | No* | Get new access token |
| `/users/change-password` | POST | Yes | Change user password |
| `/users/current-user` | GET | Yes | Get authenticated user details |
| `/users/update-account` | PATCH | Yes | Update email and fullName |
| `/users/avatar` | PATCH | Yes | Upload and update avatar |
| `/users/cover-image` | PATCH | Yes | Upload and update cover image |
| `/users/c/:username` | GET | Yes | Get user channel profile |
| `/users/watch-history` | GET | Yes | Get user's watch history |

*refresh-token can be sent in body or cookies

## 1. Register User

Creates a new user account with profile information and avatar.

**Endpoint:** `POST /api/v1/users/register`

**Authentication:** None (Public)

**Content-Type:** `multipart/form-data`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Unique username (lowercase, trimmed) |
| `email` | string | Yes | Unique email address (lowercase, trimmed) |
| `password` | string | Yes | Account password (hashed with bcrypt) |
| `fullName` | string | Yes | User's full name |
| `avatar` | file | Yes | Profile avatar image (uploaded to Cloudinary) |
| `coverImage` | file | No | Cover/banner image (uploaded to Cloudinary) |

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=SecurePass123!" \
  -F "fullName=John Doe" \
  -F "avatar=@/path/to/profile.jpg" \
  -F "coverImage=@/path/to/cover.jpg"
```

### Response - Success (201)

```json
{
  "statusCode": 201,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/.../profile.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg",
    "watchHistory": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User registered Successfully",
  "success": true
}
```

**Note:** Password and refreshToken are excluded from response via `.select("-password -refreshToken")`

### Response - Error

**400 - Missing Fields**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "All fields are required",
  "success": false
}
```

**400 - Missing Avatar**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Avatarfile is required",
  "success": false
}
```

**409 - Duplicate Username/Email**
```json
{
  "statusCode": 409,
  "data": null,
  "message": "User with email or password already exists",
  "success": false
}
```

### Business Logic

1. Validate all required fields are present and not empty
2. Check if user with same username or email already exists
3. Validate avatar file is provided
4. Upload avatar to Cloudinary (required)
5. Upload coverImage to Cloudinary (optional)
6. Create User document with:
   - Username converted to lowercase
   - Email converted to lowercase
   - Avatar: Cloudinary URL
   - CoverImage: Cloudinary URL or empty string
7. Password automatically hashed via Mongoose pre-save hook (bcrypt)
8. Return user without password and refreshToken

### Frontend Integration Example

```javascript
// Frontend code
const register = async (userData) => {
  const formData = new FormData();
  formData.append('username', userData.username);
  formData.append('email', userData.email);
  formData.append('password', userData.password);
  formData.append('fullName', userData.fullName);
  formData.append('avatar', userData.avatarFile);
  formData.append('coverImage', userData.coverImageFile);

  const response = await fetch('/api/v1/users/register', {
    method: 'POST',
    body: formData
  });

  return response.json();
};
```

---

## 2. Login User

Authenticates a user and returns JWT tokens.

**Endpoint:** `POST /api/v1/users/login`

**Authentication:** None (Public)

**Content-Type:** `application/json`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Either username or email | Username (case-insensitive) |
| `email` | string | Either username or email | Email address (case-insensitive) |
| `password` | string | Yes | User's password (plain text) |

**Note:** Must provide either username OR email, but not both.

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "avatar": "https://res.cloudinary.com/.../profile.jpg",
      "coverImage": "https://res.cloudinary.com/.../cover.jpg"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWExYjJjM2Q0ZTVmNmc3aDhpOWowazEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJmdWxsTmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzA1MzIwNjAwLCJleHAiOjE3MDUzMjE1MDB9.kJg...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWExYjJjM2Q0ZTVmNmc3aDhpOWowazEiLCJpYXQiOjE3MDUzMjA2MDAsImV4cCI6MTcwNTkyNTQwMH0.Pp..."
  },
  "message": "User Logged In Successfully",
  "success": true
}
```

**Headers Set:**
- `Set-Cookie: accessToken=...; HttpOnly; Secure`
- `Set-Cookie: refreshToken=...; HttpOnly; Secure`

### Response - Error

**400 - Username/Email Not Provided**
```json
{
  "statusCode": 401,
  "data": null,
  "message": "Username or email is required",
  "success": false
}
```

**400 - User Not Found**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "User does not exists",
  "success": false
}
```

**404 - Invalid Password**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "Invalid user credentials",
  "success": false
}
```

### Business Logic

1. Validate username or email is provided
2. Find user by username or email (case-insensitive)
3. If not found, return error
4. Compare provided password with hashed password using bcrypt
5. If password invalid, return error
6. Generate access token (15m expiry) and refresh token (7d expiry)
7. Save refresh token to user document
8. Set HTTP-only cookies for both tokens
9. Return tokens in response body
10. Return user without password and refreshToken

### Token Format

**Access Token (JWT):**
- Payload: `{_id, email, username, fullName}`
- Expiry: 15 minutes (default)
- Secret: `ACCESS_TOKEN_SECRET`

**Refresh Token (JWT):**
- Payload: `{_id}`
- Expiry: 7 days (default)
- Secret: `REFRESH_TOKEN_SECRET`

### Frontend Integration Example

```javascript
const login = async (credentials) => {
  const response = await fetch('/api/v1/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies
    body: JSON.stringify(credentials)
  });

  const data = await response.json();
  
  if (data.success) {
    // Save tokens to localStorage as backup
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    // Cookies are automatically set by browser
  }
  
  return data;
};
```

---

## 3. Logout User

Clears user's session and removes tokens.

**Endpoint:** `POST /api/v1/users/logout`

**Authentication:** Yes (Bearer token or cookie)

**Content-Type:** `application/json`

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/users/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {},
  "message": "User Logged Out Successfully",
  "success": true
}
```

**Headers Set:**
- `Set-Cookie: accessToken=; HttpOnly; Secure; Max-Age=0` (cleared)
- `Set-Cookie: refreshToken=; HttpOnly; Secure; Max-Age=0` (cleared)

### Response - Error

**401 - No Token Provided**
```json
{
  "statusCode": 401,
  "data": null,
  "message": "Invalid access token",
  "success": false
}
```

### Business Logic

1. Verify JWT token and extract user ID
2. Find user in database
3. Remove (unset) refreshToken from user document: `$unset: {refreshToken: 1}`
4. Clear accessToken and refreshToken cookies
5. Return success response

---

## 4. Refresh Access Token

Gets a new access token using refresh token.

**Endpoint:** `POST /api/v1/users/refresh-token`

**Authentication:** No (Public, but requires valid refresh token)

### Request Body (one of):

**Option 1: In Cookies**
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option 2: In Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Access token refreshed",
  "success": true
}
```

### Response - Error

**401 - No Token**
```json
{
  "statusCode": 401,
  "data": null,
  "message": "Unauthorized request",
  "success": false
}
```

**401 - Invalid Token**
```json
{
  "statusCode": 401,
  "data": null,
  "message": "Invalid refresh token",
  "success": false
}
```

**400 - Token Mismatch**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Refreshtoken is expired or used",
  "success": false
}
```

### Business Logic

1. Extract refresh token from cookies or body
2. Verify token signature with REFRESH_TOKEN_SECRET
3. Decode to get user ID
4. Find user in database
5. Verify provided token matches stored refreshToken (prevent token reuse)
6. Generate new access token (15m) and new refresh token (7d)
7. Save new refresh token to database
8. Set new cookies
9. Return both tokens in response

---

## 5. Change Password

Changes user's password.

**Endpoint:** `POST /api/v1/users/change-password`

**Authentication:** Yes (Bearer token or cookie)

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `oldPassword` | string | Yes | Current password |
| `newPassword` | string | Yes | New password |

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/users/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "OldPass123!",
    "newPassword": "NewPass456!"
  }'
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password Changed Successfully",
  "success": true
}
```

### Response - Error

**404 - Invalid Old Password**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "Invalid Password",
  "success": false
}
```

### Business Logic

1. Verify JWT and get user
2. Compare old password with stored hashed password using bcrypt
3. If invalid, return error
4. Set new password on user document (auto-hashes via pre-save hook)
5. Save user
6. Return success

---

## 6. Get Current User

Returns authenticated user's details.

**Endpoint:** `GET /api/v1/users/current-user`

**Authentication:** Yes (Bearer token or cookie)

### Request Example

```bash
curl -X GET http://localhost:8000/api/v1/users/current-user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/.../profile.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "current user fatched",
  "success": true
}
```

### Business Logic

1. Verify JWT and get user from middleware (req.user already set)
2. Return user object from request

---

## 7. Update Account Details

Updates user's email and fullName.

**Endpoint:** `PATCH /api/v1/users/update-account`

**Authentication:** Yes (Bearer token or cookie)

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | At least one | New email address |
| `fullName` | string | At least one | New full name |

### Request Example

```bash
curl -X PATCH http://localhost:8000/api/v1/users/update-account \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "fullName": "John Smith"
  }'
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "newemail@example.com",
    "fullName": "John Smith",
    "avatar": "https://res.cloudinary.com/.../profile.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg"
  },
  "message": "Account details updated successfully",
  "success": true
}
```

### Response - Error

**400 - No Fields Provided**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "All feilds are required",
  "success": false
}
```

### Business Logic

1. Verify JWT and get user
2. Validate at least one field is provided
3. Update email and/or fullName
4. Save user and return without password

---

## 8. Update Avatar

Uploads and updates user's profile avatar.

**Endpoint:** `PATCH /api/v1/users/avatar`

**Authentication:** Yes (Bearer token or cookie)

**Content-Type:** `multipart/form-data`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `avatar` | file | Yes | Avatar image file (uploaded to Cloudinary) |

### Request Example

```bash
curl -X PATCH http://localhost:8000/api/v1/users/avatar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "avatar=@/path/to/new-avatar.jpg"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/.../new-avatar.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg"
  },
  "message": "Avatar image updated successfully",
  "success": true
}
```

### Response - Error

**400 - No File**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Avatar is missing",
  "success": false
}
```

### Business Logic

1. Verify JWT and get user
2. Get avatar file from Multer (req.file)
3. Validate file is provided
4. Upload to Cloudinary (returns URL)
5. Update user avatar field with Cloudinary URL
6. Multer automatically cleans up local temp file
7. Return updated user

---

## 9. Update Cover Image

Uploads and updates user's cover/banner image.

**Endpoint:** `PATCH /api/v1/users/cover-image`

**Authentication:** Yes (Bearer token or cookie)

**Content-Type:** `multipart/form-data`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `coverImage` | file | Yes | Cover image file (uploaded to Cloudinary) |

### Request Example

```bash
curl -X PATCH http://localhost:8000/api/v1/users/cover-image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "coverImage=@/path/to/new-cover.jpg"
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/.../profile.jpg",
    "coverImage": "https://res.cloudinary.com/.../new-cover.jpg"
  },
  "message": "coverImage image updated successfully",
  "success": true
}
```

---

## 10. Get User Channel Profile

Gets public channel information for any user.

**Endpoint:** `GET /api/v1/users/c/:username`

**Authentication:** Yes (Bearer token or cookie)

**Parameters:**
- `:username` (path parameter) - Username to fetch (case-insensitive)

### Request Example

```bash
curl -X GET http://localhost:8000/api/v1/users/c/johndoe \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/.../profile.jpg",
    "coverImage": "https://res.cloudinary.com/.../cover.jpg",
    "email": "john@example.com",
    "subscribersCount": 150,
    "channelSubscribedToCount": 42,
    "isSubscribed": false
  },
  "message": "User channel fetched successfully",
  "success": true
}
```

### Response - Error

**404 - User Not Found**
```json
{
  "statusCode": 404,
  "data": null,
  "message": "Channel does not exists",
  "success": false
}
```

### Business Logic

1. Get username from path params
2. Aggregation pipeline:
   - Match user by username (case-insensitive)
   - $lookup with subscriptions collection (as subscribers)
   - $lookup with subscriptions collection (as subscribedTo)
   - Add subscribers count
   - Add channels subscribed to count
   - Add isSubscribed flag (check if current user in subscribers array)
   - Project only required fields
3. Return channel info with statistics

---

## 11. Get Watch History

Returns videos watched by the authenticated user.

**Endpoint:** `GET /api/v1/users/watch-history`

**Authentication:** Yes (Bearer token or cookie)

### Request Example

```bash
curl -X GET http://localhost:8000/api/v1/users/watch-history \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
      "title": "Amazing Video",
      "videoFile": "https://res.cloudinary.com/.../video1.mp4",
      "thumbnail": "https://res.cloudinary.com/.../thumb1.jpg",
      "duration": 1200,
      "views": 5000,
      "owner": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "username": "videocreator",
        "fullName": "Video Creator",
        "avatar": "https://res.cloudinary.com/.../avatar.jpg"
      },
      "createdAt": "2024-01-10T15:30:00.000Z"
    }
  ],
  "message": "Watch history fetched successfully",
  "success": true
}
```

### Business Logic

1. Verify JWT and get user
2. Aggregation pipeline on User collection:
   - Match current user by _id
   - $lookup with videos collection (using watchHistory array)
   - Nested lookup with users collection to get video owner details
   - Flatten owner array
   - Project required fields
3. Return watch history array

---

## Token Expiration & Refresh Flow

```
User Action Timeline:
├─ Login
│  └─ Receive: accessToken (15m), refreshToken (7d)
│
├─ API calls (next 15 minutes)
│  └─ Use: accessToken
│
├─ Token expires (15m later)
│  └─ API returns 401 Unauthorized
│
├─ Frontend detects 401
│  └─ Call: POST /refresh-token with refreshToken
│
├─ Receive new tokens
│  └─ Retry: Original API call with new accessToken
│
└─ Session expires (7 days later)
   └─ Call refresh-token returns 401
   └─ User must login again
```

---

See also: [Authentication Documentation](../authentication.md), [API Overview](README.md)
