# Environment Variables Reference

Complete guide to all environment variables required for VideoTube Backend.

## Required vs Optional

| Variable | Required | Default | Used In |
|----------|----------|---------|---------|
| MONGODB_URI | Yes | None | Database connection |
| PORT | No | 8000 | Server startup |
| ACCESS_TOKEN_SECRET | Yes | None | JWT signing |
| ACCESS_TOKEN_EXPIRY | No | 15m | Access token lifetime |
| REFRESH_TOKEN_SECRET | Yes | None | JWT signing |
| REFRESH_TOKEN_EXPIRY | No | 7d | Refresh token lifetime |
| CORS_ORIGIN | No | * | CORS configuration |
| CLOUDINARY_CLOUD_NAME | Yes | None | File uploads |
| CLOUDINARY_API_KEY | Yes | None | File uploads |
| CLOUDINARY_API_SECRET | Yes | None | File uploads |

## Detailed Reference

### MONGODB_URI

**Type:** String  
**Required:** Yes  
**Purpose:** MongoDB connection string

**Development (Local):**
```env
MONGODB_URI=mongodb://localhost:27017
```

**Development (Docker):**
```env
MONGODB_URI=mongodb://host.docker.internal:27017
# or
MONGODB_URI=mongodb://mongo:27017  # if using docker-compose
```

**Production (MongoDB Atlas):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videoTube?retryWrites=true&w=majority
```

**Format:** `mongodb://[username:password@]host[:port]/[database]`

**Database Name:** Automatically appends `videoTube` collection name from `src/constants.js`

**Connection Options:**
- `retryWrites=true` - Automatic retry on transient failures
- `w=majority` - Wait for majority replication (MongoDB Atlas requirement)

### PORT

**Type:** Number  
**Required:** No  
**Default:** 8000  
**Purpose:** Server listening port

**Example:**
```env
PORT=8000       # Development
PORT=3001       # Alternative port
PORT=5000       # Common alternative
```

**Validation:** Must be available and not in use by other process

### ACCESS_TOKEN_SECRET

**Type:** String (random, cryptographic)  
**Required:** Yes  
**Purpose:** Sign and verify access tokens (JWTs)

**Generation:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**
```env
ACCESS_TOKEN_SECRET=a7c3f9b2e1d6f4a8c9e2b5d1f3a6c8e0f2b4d6e8f0a2c4e6f8a0b2c4d6e8f0
```

**Security Rules:**
- Must be random and unpredictable
- Minimum 32 characters (256 bits)
- Different value per environment
- Never commit to git
- Never expose in logs

**Used By:** `src/middlewares/auth.middleware.js`, `src/controllers/user.controller.js`

### ACCESS_TOKEN_EXPIRY

**Type:** String (with time unit)  
**Required:** No  
**Default:** 15m  
**Purpose:** How long access token remains valid

**Valid Formats:**
```env
ACCESS_TOKEN_EXPIRY=15m         # 15 minutes
ACCESS_TOKEN_EXPIRY=1h          # 1 hour
ACCESS_TOKEN_EXPIRY=24h         # 24 hours
ACCESS_TOKEN_EXPIRY=15min       # Alternative format
ACCESS_TOKEN_EXPIRY=900s        # Seconds (15 * 60)
ACCESS_TOKEN_EXPIRY=15*60       # Arithmetic
```

**Recommendation:** 15 minutes (good balance between security and UX)

**Used By:** JWT signing in user controller

### REFRESH_TOKEN_SECRET

**Type:** String (random, cryptographic)  
**Required:** Yes  
**Purpose:** Sign and verify refresh tokens (JWTs)

**Generation:**
```bash
# Generate different secret from ACCESS_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**
```env
REFRESH_TOKEN_SECRET=b8d4g0c3f1e7a2d5b8c1e4f7a0d3b6e9c2f5a8d1e4g7b0c3d6e9f2a5b8c1d4
```

**Security Rules:**
- Must be different from ACCESS_TOKEN_SECRET
- Must be random and unpredictable
- Minimum 32 characters (256 bits)
- Different value per environment
- Never commit to git

**Used By:** `src/controllers/user.controller.js` (refresh token endpoints)

### REFRESH_TOKEN_EXPIRY

**Type:** String (with time unit)  
**Required:** No  
**Default:** 7d  
**Purpose:** How long refresh token remains valid

**Valid Formats:**
```env
REFRESH_TOKEN_EXPIRY=7d         # 7 days
REFRESH_TOKEN_EXPIRY=14d        # 14 days
REFRESH_TOKEN_EXPIRY=30d        # 30 days
REFRESH_TOKEN_EXPIRY=1w         # 1 week
REFRESH_TOKEN_EXPIRY=7*24*3600  # Seconds
```

**Recommendation:** 7 days (one week provides good security/UX balance)

**Note:** Longer than access token (typically 7 days vs 15 minutes)

**Used By:** JWT signing in user controller

### CORS_ORIGIN

**Type:** String (URL)  
**Required:** No  
**Default:** * (all origins)  
**Purpose:** Allow frontend to make requests to backend

**Development:**
```env
CORS_ORIGIN=http://localhost:3000        # React Dev Server
CORS_ORIGIN=http://localhost:5173        # Vite Dev Server
CORS_ORIGIN=http://127.0.0.1:3000
```

**Production:**
```env
CORS_ORIGIN=https://videotube.com        # Single domain
CORS_ORIGIN=https://app.videotube.com    # Subdomain
```

**Multiple Origins (if needed):**
```bash
# Note: Current implementation supports single origin
# To support multiple, modify src/app.js CORS config
CORS_ORIGIN=https://videotube.com,https://app.videotube.com
```

**Security Consideration:**
- Never use `*` in production (allows any website to access)
- Must match frontend origin exactly
- Includes protocol (http/https), domain, and port

**Used By:** `src/app.js` - express CORS middleware

### CLOUDINARY_CLOUD_NAME

**Type:** String  
**Required:** Yes  
**Purpose:** Cloudinary account identifier

**Where to find:**
1. Go to https://cloudinary.com/
2. Sign in to dashboard
3. Copy "Cloud Name" from Dashboard heading

**Example:**
```env
CLOUDINARY_CLOUD_NAME=demo  # Cloudinary's example account
CLOUDINARY_CLOUD_NAME=abc123xyz  # Your account cloud name
```

**Format:** Alphanumeric (typically 10-20 characters)

**Used By:** `src/utils/cloudinary.js` - file upload configuration

### CLOUDINARY_API_KEY

**Type:** String (numeric)  
**Required:** Yes  
**Purpose:** Authenticate with Cloudinary API

**Where to find:**
1. Go to https://cloudinary.com/console
2. Settings → API Keys
3. Copy "API Key"

**Example:**
```env
CLOUDINARY_API_KEY=123456789012345
```

**Format:** Numeric string (12-15 digits)

**Security:** Sensitive - never commit to git

**Used By:** `src/utils/cloudinary.js` - Cloudinary client configuration

### CLOUDINARY_API_SECRET

**Type:** String (alphanumeric)  
**Required:** Yes  
**Purpose:** Authenticate with Cloudinary API (secret key)

**Where to find:**
1. Go to https://cloudinary.com/console
2. Settings → API Keys
3. Copy "API Secret" (appears when you click show)

**Example:**
```env
CLOUDINARY_API_SECRET=abcdef123456789xyz
```

**Format:** Alphanumeric string

**Security Rules:**
- DO NOT expose in frontend code
- DO NOT commit to git
- DO NOT share publicly
- Rotate if accidentally exposed

**Used By:** `src/utils/cloudinary.js` - Cloudinary authentication

**Permissions:** Enables file upload, delete, and transformations

---

## .env File Template

Create `.env` file in project root:

```env
# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017

# ============================================
# Server Configuration
# ============================================
PORT=8000

# ============================================
# JWT Authentication
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ACCESS_TOKEN_SECRET=your_random_access_secret_here_32_chars_minimum
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_random_refresh_secret_here_32_chars_minimum
REFRESH_TOKEN_EXPIRY=7d

# ============================================
# CORS Configuration (Frontend URL)
# ============================================
CORS_ORIGIN=http://localhost:3000

# ============================================
# Cloudinary File Storage
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Loading Environment Variables

### Automatic Loading (Development)

```javascript
// src/index.js
import dotenv from "dotenv";
dotenv.config();
```

With nodemon, variables auto-reload on .env changes:
```bash
npm run dev
```

### Manual Loading (If needed)

```bash
# Export in terminal before running
export MONGODB_URI=mongodb://localhost:27017
export PORT=8000
node src/index.js
```

### Docker Environment

```dockerfile
# Pass via docker run
docker run -e PORT=8000 -e MONGODB_URI=mongodb://... app

# Or via .env file
docker run --env-file .env app
```

## Validation

### Check Variables Loaded

```javascript
// In src/index.js
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
// Should output values, not "undefined"
```

### Test Connections

```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017

# Test Cloudinary (via API)
curl https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/resources/image \
  -u "YOUR_API_KEY:YOUR_API_SECRET"
```

## Troubleshooting

### Variables Not Loading

**Problem:** `process.env.VARIABLE_NAME` returns undefined

**Solutions:**
1. Verify .env file exists in project root
2. Verify `dotenv.config()` called before using variables
3. Check variable names - they're case-sensitive
4. Restart development server
5. Verify no spaces around `=` in .env

### Token Verification Failing

**Problem:** 401 Unauthorized errors

**Check:**
- ACCESS_TOKEN_SECRET is long enough (>32 chars)
- ACCESS_TOKEN_SECRET is random/unique
- Secrets don't contain special characters that need escaping

### Cloudinary Uploads Failing

**Problem:** Upload returns 401 or 403 error

**Check:**
- CLOUDINARY_CLOUD_NAME is correct (from dashboard)
- CLOUDINARY_API_KEY is correct (numeric)
- CLOUDINARY_API_SECRET is correct and not exposed
- API credentials have upload permissions
- Try test upload in Cloudinary dashboard first

### CORS Errors in Browser

**Problem:** "Access-Control-Allow-Origin" error in console

**Check:**
- CORS_ORIGIN matches frontend URL exactly
- Include protocol: `http://` or `https://`
- Include port if not default: `:3000`, `:5173`
- No trailing slash: `http://localhost:3000` not `http://localhost:3000/`

## Environment-Specific Examples

### Development

```env
MONGODB_URI=mongodb://localhost:27017
PORT=8000
ACCESS_TOKEN_SECRET=dev_secret_123456789abcdefghijklmnopqrst
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=dev_refresh_123456789abcdefghijklmnopq
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=devcloud
CLOUDINARY_API_KEY=111111111111
CLOUDINARY_API_SECRET=dev_secret_xyz
```

### Staging

```env
MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/videoTube
PORT=8000
ACCESS_TOKEN_SECRET=staging_secret_randomstringhere_32chars_minimum
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=staging_refresh_randomstringhere_32chars
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=https://staging.videotube.com
CLOUDINARY_CLOUD_NAME=stagingcloud
CLOUDINARY_API_KEY=222222222222
CLOUDINARY_API_SECRET=staging_secret_abc
```

### Production

```env
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/videoTube
PORT=8000
ACCESS_TOKEN_SECRET=prod_secret_randomstringhere_32chars_PRODUCTION
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=prod_refresh_randomstringhere_32chars_PRODUCTION
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=https://videotube.com
CLOUDINARY_CLOUD_NAME=productioncloud
CLOUDINARY_API_KEY=333333333333
CLOUDINARY_API_SECRET=production_secret_xyz
```

---

See also: [Setup Guide](setup.md), [Authentication](authentication.md), [Project Context](../copilot/project-context.md)
