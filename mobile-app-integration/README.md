# Mobile App Integration Guide

## 📱 React Native Integration with CivicSignal Backend

### 1. Install Dependencies

```bash
npm install axios @react-native-async-storage/async-storage

# Or with yarn
yarn add axios @react-native-async-storage/async-storage
```

### 2. File Structure

Create these files in your React Native project:

```
your-mobile-app/
├── services/
│   └── api/
│       ├── config.ts          (API configuration & token management)
│       └── authService.ts     (Authentication methods)
├── app/
│   └── (auth)/
│       ├── signup.tsx         (Registration screen)
│       ├── verify-account.tsx (Verification screen)
│       └── signin.tsx         (Login screen)
```

### 3. Configuration

**Update API Base URL** in `config.ts`:

```typescript
// For development with physical device, use your computer's local IP
export const API_BASE_URL = 'http://192.168.1.100:3000/api';

// For production
export const API_BASE_URL = 'https://your-domain.com/api';
```

To find your computer's IP:
- **Windows**: `ipconfig` (look for IPv4)
- **Mac/Linux**: `ifconfig` or `ip addr`

### 4. Backend Setup (Already Done! ✅)

Your backend is ready with:
- ✅ CORS configured for mobile apps
- ✅ Authentication endpoints
- ✅ JWT token system
- ✅ Email & SMS verification

### 5. API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Register new user |
| `/auth/verify-email` | POST | Verify email with code |
| `/auth/verify-phone` | POST | Verify phone with code |
| `/auth/verify-email` | PATCH | Resend email code |
| `/auth/verify-phone` | PATCH | Resend phone code |
| `/auth/login` | POST | Login user |
| `/auth/logout` | POST | Logout user |

### 6. Registration Flow

```typescript
// 1. User fills signup form
const result = await AuthService.register({
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+250788123456",
  password: "SecurePass123!"
});

// 2. Navigate to verification screen
router.push({
  pathname: "/(auth)/verify-account",
  params: { email, phone }
});

// 3. Verify email
await AuthService.verifyEmail(email, "123456");

// 4. Verify phone
await AuthService.verifyPhone(phone, "654321");

// 5. Both verified → Tokens saved → User logged in
```

### 7. Request/Response Examples

**Register:**
```json
// Request
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+250788123456",
  "password": "SecurePass123!"
}

// Response
{
  "success": true,
  "message": "Registration successful!",
  "user": {
    "id": "65f...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+250788123456",
    "role": "citizen"
  }
}
```

**Verify Email:**
```json
// Request
{
  "email": "john@example.com",
  "code": "123456"
}

// Response (if phone also verified)
{
  "success": true,
  "message": "Email verified successfully!",
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "fullyVerified": true,
  "user": { ... }
}
```

### 8. Error Handling

```typescript
const result = await AuthService.register(data);

if (!result.success) {
  // Handle specific errors
  if (result.error === "An account with this email already exists") {
    // Show email already exists message
  } else if (result.details) {
    // Show validation errors
    Alert.alert("Validation Error", result.details.join("\n"));
  } else {
    // General error
    Alert.alert("Error", result.error);
  }
}
```

### 9. Token Management

Tokens are automatically:
- ✅ Saved to AsyncStorage after verification
- ✅ Included in API requests (Authorization header)
- ✅ Refreshed when expired
- ✅ Cleared on logout

### 10. Testing

**Development Testing:**
1. Start your backend: `npm run dev`
2. Note your computer's IP address
3. Update `API_BASE_URL` in config.ts
4. Run your mobile app
5. Test signup → verification → login flow

**Physical Device:**
- Ensure phone and computer are on same WiFi
- Use computer's local IP (not localhost)

**Emulator:**
- Android: Use `10.0.2.2` for localhost
- iOS: Use `localhost` or computer's IP

### 11. Common Issues

**"Network Error":**
- Check API_BASE_URL is correct
- Ensure backend is running
- Verify firewall allows connections
- Check WiFi connection

**"Access denied. Service only available in Rwanda":**
- Backend has Rwanda IP restriction
- Disable in development: Set `isRwandanIP` to always return `true`

**Tokens not saving:**
- Check AsyncStorage permissions
- Verify TokenManager methods are called

### 12. Next Steps

After authentication is working:
1. Implement issue reporting (see `docs/ISSUE_REPORTING_API.md`)
2. Add GPS location capture
3. Implement photo upload
4. Create issue list view
5. Add issue tracking

### 13. Complete User Flow

```
Landing Page
    ↓
Sign Up → Enter details
    ↓
Verification → Enter email + phone codes
    ↓
Both Verified → Auto-login (tokens saved)
    ↓
Main App → Report issues, view issues, etc.
```

### 14. Security Notes

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Email & phone verification required
- ✅ 6-digit codes expire in 10 minutes
- ✅ Rate limiting on resend (60s cooldown)

### 15. Support

If you encounter issues:
1. Check backend logs
2. Check mobile app console
3. Verify API endpoint URLs
4. Test with Postman first
5. Check network connectivity

---

**All files are ready in the `mobile-app-integration` folder!** 🎉

Copy them to your React Native project and update the import paths as needed.
