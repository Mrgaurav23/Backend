# Authentication & Security

Complete guide to authentication, authorization, and security in VideoTube Backend.

## Overview

VideoTube uses **JWT (JSON Web Tokens)** with a dual-token strategy:
- **Access Token** - Short-lived (15 minutes), used for API requests
- **Refresh Token** - Long-lived (7 days), used to obtain new access tokens
- **HTTP-only Cookies** - Secure token storage, protected from XSS
- **Bcrypt Hashing** - Password hashing with 10 salt rounds

---

## Authentication Flow

### 1. Registration

```
Frontend
  │ POST /api/v1/users/register
  │ {username, email, password, fullName, avatar, coverImage}
  ↓
Backend - registerUser()
  ├─ Validate input (all fields present)
  ├─ Check duplicate username/email
  ├─ Upload avatar to Cloudinary (required)
  ├─ Upload coverImage to Cloudinary (optional)
  ├─ Create User document
  │  └─ Pre-save hook: Hash password with bcrypt(password, 10)
  └─ Return user (without password, refreshToken)

Frontend
  └─ Receive user object
    └─ Store username, redirect to login
```

### 2. Login

```
Frontend
  │ POST /api/v1/users/login
  │ {email/username, password}
  ↓
Backend - loginUser()
  ├─ Find user by email or username (case-insensitive)
  ├─ Compare password with bcrypt: user.isPasswordCorrect(password)
  ├─ Generate tokens:
  │  ├─ accessToken = JWT with {_id, email, username, fullName}
  │  │  └─ Signed with ACCESS_TOKEN_SECRET
  │  │  └─ Expires in ACCESS_TOKEN_EXPIRY (default 15m)
  │  └─ refreshToken = JWT with {_id}
  │     └─ Signed with REFRESH_TOKEN_SECRET
  │     └─ Expires in REFRESH_TOKEN_EXPIRY (default 7d)
  ├─ Save refreshToken to User.refreshToken in database
  ├─ Set HTTP-only cookies:
  │  ├─ Set-Cookie: accessToken=...;HttpOnly;Secure
  │  └─ Set-Cookie: refreshToken=...;HttpOnly;Secure
  └─ Return {user, accessToken, refreshToken}

Frontend
  ├─ Receive tokens
  ├─ Cookies automatically set by browser (HttpOnly)
  ├─ Optionally store tokens in localStorage as backup
  └─ Redirect to dashboard
```

### 3. Protected API Request

```
Frontend
  │ GET /api/v1/users/current-user
  │ Cookie: accessToken=...
  │ OR Authorization: Bearer accessToken
  ↓
Middleware - verifyJWT()
  ├─ Extract token from:
  │  ├─ req.cookies.accessToken, OR
  │  └─ req.header("Authorization").replace("Bearer ", "")
  ├─ Verify token signature with ACCESS_TOKEN_SECRET
  ├─ Decode JWT to extract user._id
  ├─ Query User collection by _id
  ├─ Attach user to req.user
  └─ Call next() → Controller receives req.user

Controller
  ├─ Access authenticated user via req.user
  ├─ Process request
  └─ Return response

Frontend
  └─ Receive response with user data
```

### 4. Refresh Token Flow

```
Frontend (token expired)
  │ API returns 401 Unauthorized
  │ → Detect 401
  ↓
Frontend
  │ POST /api/v1/users/refresh-token
  │ Cookie: refreshToken=... OR {refreshToken: ...}
  ↓
Backend - refreshAccessToken()
  ├─ Extract refreshToken from cookies or body
  ├─ Verify token signature with REFRESH_TOKEN_SECRET
  ├─ Decode to get user._id
  ├─ Find User in database
  ├─ Compare incoming token with stored User.refreshToken
  │  └─ PREVENT token reuse attack
  ├─ If match: Generate new tokens
  │  ├─ newAccessToken (15m)
  │  └─ newRefreshToken (7d)
  ├─ Save new refreshToken to User document
  ├─ Set new cookies
  └─ Return {accessToken, refreshToken}

Frontend
  ├─ Update tokens in localStorage (if using)
  ├─ Cookies updated automatically by browser
  ├─ Retry original API call with new accessToken
  └─ Success
```

### 5. Logout

```
Frontend
  │ POST /api/v1/users/logout
  │ Authorization: Bearer accessToken
  ↓
Middleware - verifyJWT()
  └─ Verify token and extract user

Backend - logoutUser()
  ├─ Find User by req.user._id
  ├─ Remove (unset) refreshToken field: {$unset: {refreshToken: 1}}
  ├─ Clear cookies:
  │  ├─ Set-Cookie: accessToken=;Max-Age=0
  │  └─ Set-Cookie: refreshToken=;Max-Age=0
  └─ Return success

Frontend
  ├─ Cookies cleared by browser
  ├─ Clear localStorage (if using)
  ├─ Redirect to login
  └─ All previous tokens now invalid
```

---

## Token Details

### Access Token Payload

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "user@example.com",
  "username": "username",
  "fullName": "User Name",
  "iat": 1705320600,
  "exp": 1705321500
}
```

**iat** (issued at) - When token was created  
**exp** (expiration) - When token expires (15 minutes later)

### Refresh Token Payload

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "iat": 1705320600,
  "exp": 1705925400
}
```

Minimal payload with only user ID. Full user info retrieved from access token or database.

---

## Authorization

### Authorization Checks

Authorization (checking if user has permission) happens at **controller level**, not middleware.

**Pattern:**

```javascript
const updateVideo = asyncHandler(async (req, res) => {
  // Get resource
  const video = await Video.findById(videoId);

  // Authorization: Check ownership
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // Proceed with update
  // ...
});
```

### Protected Endpoints

All endpoints except the following require `verifyJWT`:

- `POST /api/v1/users/register` - Public
- `POST /api/v1/users/login` - Public
- `POST /api/v1/users/refresh-token` - Public (but requires valid refresh token)
- `GET /api/v1/healthcheck/` - Public

All other endpoints require valid accessToken.

### Owner-Only Operations

For resource-specific operations, ownership is checked:

| Operation | Resource | Check |
|-----------|----------|-------|
| Update | User Account | `currentUser._id === user._id` |
| Update | Video | `currentUser._id === video.owner` |
| Update/Delete | Comment | `currentUser._id === comment.owner` |
| Update/Delete | Tweet | `currentUser._id === tweet.owner` |
| Add/Remove Video | Playlist | `currentUser._id === playlist.owner` |

---

## Password Security

### Hashing

Passwords are hashed using **bcrypt** with 10 salt rounds:

```javascript
// Pre-save hook in User model
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**Why bcrypt?**
- Slow (computationally expensive) - prevents brute force
- Salted - same password produces different hashes
- Industry standard for password hashing

### Password Verification

```javascript
// Instance method in User model
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
```

Compares plain text password with hashed value safely.

### Password Storage

- Passwords **never** returned in responses (filtered with `.select("-password")`)
- Passwords **never** logged or debugged
- Only hashed values stored in database

---

## Security Features

### HTTP-only Cookies

**Advantages:**
- Automatically sent with requests (transparent to JavaScript)
- Cannot be accessed by JavaScript (protected from XSS)
- Automatically cleared when origin changes

**Cloudinary Library Configuration:**
```javascript
const options = {
  httpOnly: true,  // JavaScript cannot access
  secure: true     // HTTPS only (production)
};

res.cookie("accessToken", accessToken, options);
```

### JWT Signing Secrets

**Environment Variables (Required):**
```
ACCESS_TOKEN_SECRET=your_access_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRY=7d
```

**Must be:**
- Cryptographically random
- Unique per environment (dev, staging, prod)
- Stored securely (not in source code)
- Never shared or committed to git

### CORS Configuration

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // e.g., http://localhost:3000
  credentials: true                  // Allow cookies
}));
```

Ensures frontend can only be accessed from allowed origins.

---

## Security Recommendations (Not Implemented)

### Should Be Added

1. **Rate Limiting**
   - Limit login attempts: 5 attempts per 15 minutes
   - Prevent brute force attacks
   - Package: `express-rate-limit`

2. **Input Validation**
   - Validate email format
   - Validate password strength
   - Sanitize inputs
   - Package: `joi`, `express-validator`

3. **HTTPS/TLS**
   - Use in production
   - Secure tokens in transit
   - Required for `Secure` cookie flag

4. **Request Logging**
   - Log all auth attempts
   - Log failed auth attempts
   - Detect suspicious patterns
   - Package: `morgan`, `winston`

5. **Refresh Token Rotation**
   - Rotate refresh tokens on each use
   - Track token versions
   - Invalidate old versions

6. **Token Blacklisting**
   - Blacklist tokens on logout
   - Prevent reuse of expired tokens
   - Implement with Redis cache

7. **IP Whitelisting**
   - Restrict API access by IP
   - Useful for admin endpoints

8. **API Key Authentication**
   - Additional layer for third-party access
   - Different from user authentication

---

## Common Issues & Solutions

### Issue: 401 Unauthorized

**Cause:** No token or invalid token

**Solution:**
- Ensure token is sent in cookies or Authorization header
- Check token hasn't expired
- Call `/refresh-token` to get new access token
- Re-login if refresh token expired

### Issue: 403 Forbidden

**Cause:** User lacks permission (not owner)

**Solution:**
- Verify you're attempting to modify your own resources
- Check user ID matches resource owner
- Cannot modify other users' videos, comments, etc.

### Issue: Token Expires While Using App

**Solution:** Automatic refresh flow
- Frontend detects 401
- Calls `/refresh-token` with refreshToken
- Retries original request with new accessToken
- User doesn't need to re-login

### Issue: Refresh Token Expired (7 days)

**Solution:** User must login again
- Refresh token expired, cannot get new access token
- Clear localStorage
- Redirect to login page
- User enters credentials again

---

## Debugging Authentication Issues

### Check JWT Token

```bash
# Decode JWT (online tool or node-jwt-decode package)
curl http://localhost:8000/api/v1/users/current-user \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Check Cookies

```bash
# Browser DevTools → Application → Cookies → localhost:8000
# Should see: accessToken, refreshToken
```

### Test Endpoints

```bash
# Login (get tokens)
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use returned accessToken
curl http://localhost:8000/api/v1/users/current-user \
  -H "Authorization: Bearer <accessToken>"

# Refresh token (after access expires)
curl -X POST http://localhost:8000/api/v1/users/refresh-token \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

See also: [User APIs](api/users.md), [Architecture](architecture.md)
