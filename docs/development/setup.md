# Development Setup

Complete guide to setting up VideoTube Backend for local development.

## Prerequisites

### System Requirements

- **Node.js** 18 or higher
  - Check: `node --version`
  - Install from: https://nodejs.org/

- **npm** (comes with Node.js)
  - Check: `npm --version`

- **Git**
  - Check: `git --version`
  - Install from: https://git-scm.com/

- **MongoDB** (Choose one)
  - Local MongoDB instance (Docker or native)
  - MongoDB Atlas cloud (free tier available)

- **Cloudinary Account** (for file uploads)
  - Sign up at: https://cloudinary.com/ (free tier)

## Installation Steps

### 1. Clone Repository

```bash
# Clone the backend repository
git clone <repository-url>
cd Backend

# Or, if you already have the files, just navigate to directory
cd /path/to/Backend
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list
```

**Dependencies installed:**
- express (web framework)
- mongoose (database ODM)
- jsonwebtoken (JWT auth)
- bcrypt (password hashing)
- multer (file uploads)
- cloudinary (file storage)
- cookie-parser (parse cookies)
- cors (CORS handling)
- dotenv (environment variables)
- nodemon (development auto-reload)

### 3. Create .env File

Create a `.env` file in the project root with required environment variables.

#### Option A: Create manually

```bash
# Create .env file
touch .env  # Linux/Mac
# or
ni .env    # Windows PowerShell

# Edit and add variables below
```

#### Option B: Copy from sample

```bash
cp .env.sample .env
# Edit .env with your values
```

### 4. Configure Environment Variables

Edit `.env` file with your configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# Server Port
PORT=8000

# JWT Secrets (generate random strings)
# Example: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ACCESS_TOKEN_SECRET=your_random_secret_for_access_token_here
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_random_secret_for_refresh_token_here
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration (frontend origin)
CORS_ORIGIN=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Set Up MongoDB

#### Option A: Local MongoDB (Docker)

```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo

# Verify running
docker ps
```

Update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017
```

#### Option B: Local MongoDB (Native)

```bash
# Install MongoDB Community Edition
# macOS (Homebrew):
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Windows: Download from https://www.mongodb.com/try/download/community
# Linux: Follow https://docs.mongodb.com/manual/installation/
```

Update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017
```

#### Option C: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net`)
5. Update `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videoTube?retryWrites=true&w=majority
```

### 6. Set Up Cloudinary

1. Sign up at https://cloudinary.com/ (free tier)
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Update `.env`:

```env
CLOUDINARY_CLOUD_NAME=abc123
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=secret_key_here
```

### 7. Verify Setup

```bash
# Check all dependencies installed
npm ls --depth=0

# Check .env file
cat .env  # Linux/Mac
type .env # Windows

# Test MongoDB connection
# Start server (see next section) and check logs
```

## Running the Server

### Development Mode

```bash
# Start with nodemon (auto-reload on file changes)
npm run dev

# Expected output:
# Server is running at port : 8000
# MongoDB connected !! DB HOST: localhost
```

### Production Mode

```bash
# Start normally (no auto-reload)
node src/index.js
```

## Verification

### Test Server Health

```bash
# Health check endpoint (no auth needed)
curl http://localhost:8000/api/v1/healthcheck/

# Expected response:
# {"statusCode":200,"data":{},"message":"OK","success":true}
```

### Test User Registration

```bash
# Register a test user
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "username=testuser" \
  -F "email=test@example.com" \
  -F "password=Password123!" \
  -F "fullName=Test User" \
  -F "avatar=@/path/to/image.jpg"

# Expected response: User object with statusCode 201
```

### Test Login

```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Expected response: User object with accessToken and refreshToken
```

## Development Workflow

### Project Structure

```
Backend/
├── src/
│   ├── index.js         # Entry point
│   ├── app.js           # Express setup
│   ├── constants.js     # Constants
│   ├── routes/          # Route definitions
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── middlewares/     # Middleware
│   ├── utils/           # Utilities
│   └── db/              # Database connection
├── .env                 # Configuration (not in git)
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
└── README.md           # Project README
```

### Making Changes

1. Edit files in `src/` directory
2. Save file
3. Nodemon automatically restarts server
4. Test changes with curl or Postman

### Common Development Commands

```bash
# View logs
npm run dev  # Shows logs in terminal

# Stop server
Ctrl + C

# Restart server manually
npm run dev

# Install new package
npm install package-name

# Remove package
npm uninstall package-name

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Debugging

### Enable Verbose Logging

Add `console.log` statements in controllers/routes:

```javascript
console.log("Received request:", req.body);
console.log("User from middleware:", req.user);
```

### Check Database Connection

```javascript
// In src/index.js, check if connection succeeded
// Console output should show:
// "MongoDB connected !! DB HOST: localhost"
```

### View Database Content

#### Using MongoDB Compass (GUI)

1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Browse collections and documents

#### Using Mongo CLI

```bash
# Connect to MongoDB
mongosh

# Use videoTube database
use videoTube

# Show collections
show collections

# Query users
db.users.find()

# Query videos
db.videos.find()

# Exit
exit
```

## Testing Endpoints

### Using curl

```bash
# Get all videos
curl http://localhost:8000/api/v1/video/ \
  -H "Authorization: Bearer <token>"

# Get user profile
curl http://localhost:8000/api/v1/users/current-user \
  -H "Authorization: Bearer <token>"
```

### Using Postman

1. Download: https://www.postman.com/downloads/
2. Create new request
3. Set method (GET, POST, etc.)
4. Set URL: `http://localhost:8000/api/v1/users/login`
5. Set body: JSON with credentials
6. Send
7. View response

### Using REST Client VS Code Extension

Create `test.http` file:

```http
### Health check
GET http://localhost:8000/api/v1/healthcheck/

### Login
POST http://localhost:8000/api/v1/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}

### Get current user (requires token)
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

GET http://localhost:8000/api/v1/users/current-user
Authorization: Bearer {{token}}
```

## Troubleshooting

### Port Already in Use

```bash
# Error: "EADDRINUSE: address already in use :::8000"

# Option 1: Kill process using port
# macOS/Linux:
lsof -i :8000
kill -9 <PID>

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Option 2: Use different port
PORT=8001 npm run dev
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
# Windows:
sc query MongoDB  # Should show "RUNNING"

# macOS:
brew services list  # Should show "started"

# Linux:
systemctl status mongod

# Verify connection string in .env
# Should be: mongodb://localhost:27017 (or your Atlas URI)
```

### Cloudinary Upload Fails

```bash
# Check Cloudinary credentials in .env
# - CLOUDINARY_CLOUD_NAME must not be empty
# - API_KEY and API_SECRET must be valid
# - Can test in Cloudinary dashboard

# Check file is valid
# - Must be image or video
# - Should not exceed size limits
```

### Token Expired / 401 Errors

```bash
# Solution: Refresh token
curl -X POST http://localhost:8000/api/v1/users/refresh-token \
  -d '{"refreshToken":"<your_refresh_token>"}'

# Get new accessToken from response
# Use new token in subsequent requests
```

### Validation Errors

```bash
# Check error message in response
# Common issues:
# - Required fields missing
# - Invalid data format
# - Duplicate username/email
# - File upload failed

# Log request body to debug
console.log("Request body:", req.body);
```

## Environment-Specific Configuration

### Development (Local)

```env
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:3000
PORT=8000
ACCESS_TOKEN_EXPIRY=15m
```

### Staging

```env
MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net
CORS_ORIGIN=https://staging.videotube.com
PORT=8000
ACCESS_TOKEN_EXPIRY=15m
```

### Production

```env
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net
CORS_ORIGIN=https://videotube.com
PORT=8000
ACCESS_TOKEN_EXPIRY=15m
# Additional security settings
```

## Next Steps

1. **Understand the codebase** - Read [Architecture](architecture.md)
2. **Explore API endpoints** - Check [API Reference](api/README.md)
3. **Learn database structure** - See [Database Schema](database/schema.md)
4. **Start developing** - Make changes in `src/` and test with API calls
5. **Deploy** - Follow deployment guide (not included in this repo)

---

See also: [Environment Variables](development/environment.md), [Tech Stack](tech-stack.md)
