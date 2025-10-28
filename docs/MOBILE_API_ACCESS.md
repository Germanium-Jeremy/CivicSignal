# Mobile App API Access Guide

## Overview

This document explains how the CivicSignal backend handles requests from mobile applications and web clients.

## 🎯 Key Concepts

### CORS (Cross-Origin Resource Sharing)

**CORS is a BROWSER security feature** that prevents web pages from making requests to different domains. It does NOT apply to mobile apps.

### Mobile Apps vs Web Browsers

| Feature | Mobile Apps (iOS/Android) | Web Browsers |
|---------|---------------------------|--------------|
| CORS Enforcement | ❌ No | ✅ Yes |
| Origin Header | ❌ Not sent | ✅ Always sent |
| Preflight Requests | ❌ No | ✅ Yes (OPTIONS) |
| Direct API Access | ✅ Yes | ⚠️ Requires CORS |

## 📱 Mobile App Configuration

### Your mobile app can:
- ✅ Make direct HTTP requests to all API endpoints
- ✅ Use any HTTP method (GET, POST, PUT, PATCH, DELETE)
- ✅ Send Authorization headers with JWT tokens
- ✅ No special configuration needed

### Example Mobile App Request (React Native/Flutter)

```javascript
// React Native example
const response = await fetch('https://api.civicsignal.rw/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // No need to worry about CORS!
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

```dart
// Flutter/Dart example
final response = await http.post(
  Uri.parse('https://api.civicsignal.rw/api/auth/login'),
  headers: {
    'Content-Type': 'application/json',
    // No CORS issues with mobile apps!
  },
  body: jsonEncode({
    'email': 'user@example.com',
    'password': 'password123',
  }),
);
```

## 🌐 Web Browser Configuration

The backend is configured to handle web browser requests with proper CORS headers.

### Development
- All origins are allowed (`*`)
- Perfect for local development and testing

### Production
You can restrict origins by setting the `ALLOWED_ORIGINS` environment variable:

```bash
# .env.production
ALLOWED_ORIGINS=https://civicsignal.rw,https://admin.civicsignal.rw,https://www.civicsignal.rw
```

## 🔐 Security Features

### Current Configuration

1. **CORS Headers**: Properly configured for web browsers
2. **Security Headers**:
   - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
   - `X-Frame-Options: DENY` - Prevents clickjacking
   - `X-XSS-Protection: 1; mode=block` - XSS protection

3. **Authentication**: JWT tokens required for protected endpoints
4. **Preflight Caching**: 24-hour cache for OPTIONS requests

### Mobile App Security Best Practices

For your mobile app, implement these security measures:

1. **Token Storage**
   - Use secure storage (Keychain on iOS, Keystore on Android)
   - Never store tokens in plain SharedPreferences/UserDefaults

2. **HTTPS Only**
   - Always use HTTPS in production
   - Implement certificate pinning for extra security

3. **Token Refresh**
   - Implement automatic token refresh
   - Handle 401 errors gracefully

4. **API Key** (Optional)
   - Consider adding an API key header for mobile apps
   - Helps identify and rate-limit mobile clients

## 📊 API Endpoints Available to Mobile Apps

All API endpoints under `/api/` are accessible:

### Public Endpoints (No Auth Required)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-phone` - Phone verification

### Protected Endpoints (Auth Required)
- `GET /api/user/profile` - Get user profile
- `POST /api/issues` - Create an issue
- `GET /api/issues` - Get issues list
- `GET /api/issues/[id]` - Get specific issue
- `PATCH /api/issues/[id]` - Update issue
- And many more...

### Authentication Flow for Mobile Apps

```javascript
// 1. Register
const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName, email, phone, password })
});

// 2. Verify email and phone
await fetch(`${API_BASE}/api/auth/verify-email`, {
  method: 'POST',
  body: JSON.stringify({ email, code })
});

await fetch(`${API_BASE}/api/auth/verify-phone`, {
  method: 'POST',
  body: JSON.stringify({ phone, code })
});

// 3. Login (or tokens returned after verification)
const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const { tokens } = await loginResponse.json();

// 4. Use tokens for authenticated requests
const profileResponse = await fetch(`${API_BASE}/api/user/profile`, {
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 🚀 Deployment Considerations

### Development
- Current configuration works out of the box
- No environment variables needed

### Production
1. Set `NODE_ENV=production`
2. (Optional) Configure `ALLOWED_ORIGINS` for web clients
3. Ensure HTTPS is enabled
4. Consider implementing rate limiting per IP or API key

### Load Balancing
- CORS headers are set at the Next.js middleware level
- Works with any load balancer (nginx, AWS ALB, etc.)
- No special configuration needed

## 🧪 Testing

### Test Mobile App Access
```bash
# Simulate mobile app request (no Origin header)
curl -X POST https://api.civicsignal.rw/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Web Browser Access
```bash
# Simulate browser request (with Origin header)
curl -X POST https://api.civicsignal.rw/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://civicsignal.rw" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Preflight Request
```bash
# Browser sends OPTIONS before actual request
curl -X OPTIONS https://api.civicsignal.rw/api/auth/login \
  -H "Origin: https://civicsignal.rw" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

## 📝 Summary

✅ **Mobile apps can access all API endpoints without any CORS configuration**  
✅ **Web browsers are handled with proper CORS headers**  
✅ **Security headers are in place for all clients**  
✅ **Production-ready with environment variable support**  
✅ **No need to whitelist individual mobile device IPs or origins**  

Your backend is ready to handle hundreds or thousands of mobile app clients! 🎉
