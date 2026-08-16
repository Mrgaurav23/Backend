# Health Check API

Simple server health check endpoint.

## Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/healthcheck/` | GET | No | Check server health status |

## Health Check Endpoint

Verifies that the server is running and responsive.

**Endpoint:** `GET /api/v1/healthcheck/`

**Authentication:** None (Public)

### Request Example

```bash
curl http://localhost:8000/api/v1/healthcheck/
```

### Response - Success (200)

```json
{
  "statusCode": 200,
  "data": {},
  "message": "OK",
  "success": true
}
```

### Use Cases

1. **Server Startup Verification** - Check if server started successfully
2. **Monitoring & Uptime Checks** - Periodic health checks from monitoring systems
3. **Load Balancer Health** - Health check for load balancers
4. **Deployment Verification** - Verify deployment completed successfully

### Simple Response

The health check is deliberately simple - just returns `OK` status with no additional data.

### Frontend Integration

```javascript
// Check if backend is alive
const checkServerHealth = async () => {
  try {
    const response = await fetch('/api/v1/healthcheck/');
    const data = await response.json();
    return data.success && response.status === 200;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

// Example: Check health on app startup
window.addEventListener('load', async () => {
  const isHealthy = await checkServerHealth();
  if (!isHealthy) {
    console.warn('Backend server may be down');
    // Show error message to user
  }
});
```

### Monitoring Example

```bash
#!/bin/bash
# Simple health check script

while true; do
  response=$(curl -s http://localhost:8000/api/v1/healthcheck/)
  
  if echo "$response" | grep -q '"success":true'; then
    echo "$(date): Server is healthy"
  else
    echo "$(date): Server health check failed!"
    # Send alert, restart server, etc.
  fi
  
  sleep 60  # Check every minute
done
```

---

See also: [API Overview](README.md)
