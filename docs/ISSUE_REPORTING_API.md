# Issue Reporting API Documentation

Complete API documentation for the mobile app team to implement issue reporting functionality.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Issue Categories](#issue-categories)
5. [Image Upload](#image-upload)
6. [Complete Flow](#complete-flow)
7. [Code Examples](#code-examples)
8. [Error Handling](#error-handling)

---

## Overview

The Issue Reporting system allows citizens to report civic issues through the mobile app. The system includes:
- ✅ 15 predefined issue categories
- ✅ GPS location capture and validation
- ✅ Photo upload with automatic compression
- ✅ Device verification to prevent scam reports
- ✅ Unique tracking numbers (e.g., CS-2024-0001)
- ✅ Daily submission limits (10 issues per day)
- ✅ Real-time issue tracking
- ✅ Public map display

---

## Authentication

All issue-related endpoints (except GET requests for public viewing) require authentication.

### Required Headers
```javascript
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

### Getting Tokens
Users must be logged in and verified. See [Authentication API docs](./AUTHENTICATION_API.md).

---

## API Endpoints

### Base URL
```
Production: https://api.civicsignal.rw/api
Development: http://localhost:3000/api
```

---

## 1. Get Issue Categories

Get all available issue categories for the dropdown/picker.

**Endpoint:** `GET /api/issues/categories`  
**Authentication:** Not required  
**Rate Limit:** None

### Request
```http
GET /api/issues/categories HTTP/1.1
Host: api.civicsignal.rw
```

### Response
```json
{
  "success": true,
  "message": "Issue categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "roads_infrastructure",
        "name": "Roads & Infrastructure",
        "description": "Potholes, damaged roads, broken sidewalks, road signs",
        "icon": "🛣️",
        "color": "#FF6B6B",
        "priority": "medium",
        "estimatedResponseTime": "3-7 days",
        "relatedAgencyTypes": ["Municipal Corporation", "Road Authority"]
      },
      {
        "id": "water_supply",
        "name": "Water Supply",
        "description": "Water leaks, no water supply, contaminated water, burst pipes",
        "icon": "💧",
        "color": "#4ECDC4",
        "priority": "high",
        "estimatedResponseTime": "1-3 days",
        "relatedAgencyTypes": ["Water Authority", "Municipal Corporation"]
      }
      // ... 13 more categories
    ],
    "total": 15
  }
}
```

### Mobile App Implementation
```javascript
// React Native / Expo example
const fetchCategories = async () => {
  try {
    const response = await fetch('https://api.civicsignal.rw/api/issues/categories');
    const data = await response.json();
    
    if (data.success) {
      setCategories(data.data.categories);
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};
```

---

## 2. Upload Photos

Upload photos before creating the issue report. Images are automatically compressed.

**Endpoint:** `POST /api/issues/upload`  
**Authentication:** Required  
**Content-Type:** `application/json`  
**Max Images:** 5 per request  
**Max Size:** 10MB per image

### Request (Base64)
```json
{
  "images": [
    {
      "data": "iVBORw0KGgoAAAANSUhEUgAA...", // Base64 string (without data URL prefix)
      "mimeType": "image/jpeg"
    },
    {
      "data": "/9j/4AAQSkZJRgABAQAAAQAB...",
      "mimeType": "image/png"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      {
        "url": "/uploads/issues/user123-1234567890-abc123.jpg",
        "thumbnailUrl": "/uploads/issues/thumbnails/user123-1234567890-abc123.jpg",
        "size": 245632,
        "originalSize": 1024000,
        "mimeType": "image/jpeg",
        "compressionRatio": "76.00%"
      },
      {
        "url": "/uploads/issues/user123-1234567891-def456.jpg",
        "thumbnailUrl": "/uploads/issues/thumbnails/user123-1234567891-def456.jpg",
        "size": 189432,
        "originalSize": 856000,
        "mimeType": "image/jpeg",
        "compressionRatio": "77.88%"
      }
    ]
  }
}
```

### Mobile App Implementation
```javascript
// React Native with Expo ImagePicker
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const uploadPhotos = async () => {
  try {
    // Pick images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) return;

    // Prepare images for upload
    const images = result.assets.map(asset => ({
      data: asset.base64,
      mimeType: asset.type || 'image/jpeg',
    }));

    // Upload
    const response = await fetch('https://api.civicsignal.rw/api/issues/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Save photo URLs for issue creation
      setPhotoUrls(data.data.images);
      console.log('Photos uploaded successfully');
    }
  } catch (error) {
    console.error('Photo upload failed:', error);
  }
};
```

---

## 3. Create Issue

Create a new issue report with all the collected information.

**Endpoint:** `POST /api/issues`  
**Authentication:** Required  
**Rate Limit:** 10 issues per day per user

### Request
```json
{
  "title": "Large pothole on Main Street",
  "description": "There is a large pothole near the intersection that is damaging vehicles. It appeared after the recent heavy rains.",
  "category": "roads_infrastructure",
  "location": {
    "latitude": -1.9441,
    "longitude": 30.0619,
    "address": "Main Street, Kigali City",
    "district": "Gasabo",
    "sector": "Remera"
  },
  "photos": [
    {
      "url": "/uploads/issues/user123-1234567890-abc123.jpg",
      "thumbnailUrl": "/uploads/issues/thumbnails/user123-1234567890-abc123.jpg",
      "size": 245632,
      "mimeType": "image/jpeg"
    }
  ],
  "deviceInfo": {
    "deviceId": "ABC123-XYZ789-DEF456",
    "deviceModel": "iPhone 14 Pro",
    "osVersion": "iOS 17.2",
    "appVersion": "1.0.0"
  },
  "priority": "high"
}
```

### Required Fields
- `title` (string, max 200 chars)
- `category` (string, must be valid category ID)
- `location.latitude` (number, -90 to 90)
- `location.longitude` (number, -180 to 180)
- `deviceInfo.deviceId` (string, unique device identifier)

### Optional Fields
- `description` (string, max 2000 chars)
- `location.address` (string)
- `location.district` (string)
- `location.sector` (string)
- `photos` (array of photo objects from upload endpoint)
- `deviceInfo.deviceModel` (string)
- `deviceInfo.osVersion` (string)
- `deviceInfo.appVersion` (string)
- `priority` ('low' | 'medium' | 'high' | 'urgent')

### Response (Success)
```json
{
  "success": true,
  "message": "Issue reported successfully",
  "data": {
    "issue": {
      "_id": "65f7b3c4d8e9a1b2c3d4e5f6",
      "trackingNumber": "CS-2024-0123",
      "title": "Large pothole on Main Street",
      "description": "There is a large pothole...",
      "category": "roads_infrastructure",
      "priority": "high",
      "status": "submitted",
      "location": {
        "type": "Point",
        "coordinates": [30.0619, -1.9441],
        "address": "Main Street, Kigali City",
        "district": "Gasabo",
        "sector": "Remera"
      },
      "photos": [...],
      "submittedAt": "2024-01-20T10:30:00.000Z",
      "reportedBy": {
        "_id": "user123",
        "fullName": "John Doe",
        "email": "john@example.com"
      }
    },
    "trackingNumber": "CS-2024-0123",
    "estimatedResponseTime": "3-7 days"
  }
}
```

### Response (Rate Limit Exceeded - 429)
```json
{
  "success": false,
  "error": "Daily submission limit reached",
  "message": "You have reached the maximum number of issue reports for today. Please try again after 12:00 AM.",
  "remaining": 0,
  "resetAt": "2024-01-21T00:00:00.000Z"
}
```

### Response (Device Not Verified - 403)
```json
{
  "success": false,
  "error": "Device verification failed",
  "message": "This device is not registered with your account. Please use the device you registered with or contact support.",
  "trustScore": 25
}
```

---

## 4. Get Issues List

Retrieve issues with filtering, pagination, and geolocation support.

**Endpoint:** `GET /api/issues`  
**Authentication:** Optional (required for private issues)

### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 20) | `?limit=50` |
| `status` | string | Filter by status | `?status=submitted` |
| `priority` | string | Filter by priority | `?priority=high` |
| `category` | string | Filter by category | `?category=water_supply` |
| `district` | string | Filter by district | `?district=Gasabo` |
| `sector` | string | Filter by sector | `?sector=Remera` |
| `userId` | string | Get user's own issues | `?userId=user123` |
| `latitude` | number | Center latitude for nearby search | `?latitude=-1.9441` |
| `longitude` | number | Center longitude for nearby search | `?longitude=30.0619` |
| `radius` | number | Search radius in meters (default: 5000) | `?radius=10000` |

### Example Requests
```javascript
// Get all public issues (paginated)
GET /api/issues?page=1&limit=20

// Get high priority issues
GET /api/issues?priority=high

// Get water supply issues in Gasabo
GET /api/issues?category=water_supply&district=Gasabo

// Get nearby issues (within 5km)
GET /api/issues?latitude=-1.9441&longitude=30.0619&radius=5000

// Get user's own issues
GET /api/issues?userId=user123
```

### Response
```json
{
  "success": true,
  "message": "Issues retrieved successfully",
  "data": {
    "issues": [
      {
        "_id": "65f7b3c4d8e9a1b2c3d4e5f6",
        "trackingNumber": "CS-2024-0123",
        "title": "Large pothole on Main Street",
        "description": "There is a large pothole...",
        "category": "roads_infrastructure",
        "priority": "high",
        "status": "submitted",
        "location": {
          "type": "Point",
          "coordinates": [30.0619, -1.9441],
          "address": "Main Street, Kigali City",
          "district": "Gasabo",
          "sector": "Remera"
        },
        "photos": [...],
        "reportedBy": {
          "fullName": "John Doe",
          "email": "john@example.com"
        },
        "assignedAgency": {
          "name": "City Municipal Corporation",
          "type": "Municipal Corporation"
        },
        "submittedAt": "2024-01-20T10:30:00.000Z",
        "viewCount": 45,
        "upvoteCount": 12
      }
      // ... more issues
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

## Complete Flow

### Step-by-Step Implementation

```javascript
// STEP 1: Initialize and get categories
const initializeIssueReporting = async () => {
  try {
    // Fetch categories
    const categoriesResponse = await fetch(`${API_BASE}/issues/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      setCategories(categoriesData.data.categories);
    }
  } catch (error) {
    console.error('Initialization failed:', error);
  }
};

// STEP 2: Capture GPS location
const captureLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Location permission required');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Optional: Reverse geocode for address
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: address[0]?.street || '',
      district: address[0]?.city || '',
      sector: address[0]?.subregion || '',
    };
  } catch (error) {
    console.error('Location capture failed:', error);
    return null;
  }
};

// STEP 3: Upload photos
const uploadPhotos = async (selectedImages) => {
  try {
    const images = selectedImages.map(asset => ({
      data: asset.base64,
      mimeType: asset.type || 'image/jpeg',
    }));

    const response = await fetch(`${API_BASE}/issues/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images }),
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.images;
    }
    
    throw new Error(data.error || 'Upload failed');
  } catch (error) {
    console.error('Photo upload failed:', error);
    throw error;
  }
};

// STEP 4: Get device info
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

const getDeviceInfo = () => {
  return {
    deviceId: Constants.deviceId || Constants.installationId,
    deviceModel: `${Device.manufacturer} ${Device.modelName}`,
    osVersion: `${Device.osName} ${Device.osVersion}`,
    appVersion: Application.nativeApplicationVersion || '1.0.0',
  };
};

// STEP 5: Submit issue
const submitIssue = async (issueData) => {
  try {
    setLoading(true);

    // Validate required fields
    if (!issueData.title || !issueData.category || !issueData.location) {
      throw new Error('Missing required fields');
    }

    const response = await fetch(`${API_BASE}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    });

    const data = await response.json();

    if (data.success) {
      // Show success screen with tracking number
      showConfirmation(data.data.trackingNumber);
      return data.data;
    }

    // Handle specific errors
    if (response.status === 429) {
      alert(data.message); // Rate limit message
    } else if (response.status === 403) {
      alert(data.message); // Device verification failed
    } else {
      throw new Error(data.error || 'Submission failed');
    }
  } catch (error) {
    console.error('Issue submission failed:', error);
    alert('Failed to submit issue. Please try again.');
  } finally {
    setLoading(false);
  }
};

// COMPLETE FLOW
const handleReportIssue = async () => {
  try {
    // 1. Capture location
    const location = await captureLocation();
    if (!location) return;

    // 2. Upload photos (if any)
    let photoUrls = [];
    if (selectedPhotos.length > 0) {
      photoUrls = await uploadPhotos(selectedPhotos);
    }

    // 3. Get device info
    const deviceInfo = getDeviceInfo();

    // 4. Submit issue
    const issueData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category: selectedCategory,
      location,
      photos: photoUrls,
      deviceInfo,
      priority: selectedPriority || undefined,
    };

    const result = await submitIssue(issueData);

    if (result) {
      // Navigate to confirmation screen
      navigation.navigate('Confirmation', {
        trackingNumber: result.trackingNumber,
        estimatedResponseTime: result.estimatedResponseTime,
      });
    }
  } catch (error) {
    console.error('Report issue flow failed:', error);
  }
};
```

---

## Error Handling

### Common Error Codes

| Status Code | Error | Meaning |
|-------------|-------|---------|
| 400 | Bad Request | Missing or invalid required fields |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | Device verification failed or low trust score |
| 429 | Too Many Requests | Daily submission limit reached (10/day) |
| 500 | Internal Server Error | Server error, retry later |

### Error Response Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    // Additional error details (if available)
  }
}
```

### Recommended Error Handling
```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    switch (response.status) {
      case 400:
        alert(`Invalid data: ${data.message}`);
        break;
      case 401:
        // Token expired, refresh or re-login
        await refreshToken();
        break;
      case 403:
        alert('Device verification failed. Please contact support.');
        break;
      case 429:
        alert(`Rate limit exceeded. ${data.message}`);
        break;
      case 500:
        alert('Server error. Please try again later.');
        break;
      default:
        alert(`Error: ${data.message || 'Unknown error'}`);
    }
    return;
  }

  // Success handling
  if (data.success) {
    // Process successful response
  }
} catch (error) {
  console.error('Request failed:', error);
  alert('Network error. Please check your internet connection.');
}
```

---

## Testing

### Test Account
Use your registered account or create a test account through the registration API.

### Test Data
```javascript
// Sample issue data for testing
const testIssueData = {
  title: "Test Issue - Broken Street Light",
  description: "This is a test issue report for development purposes.",
  category: "street_lighting",
  location: {
    latitude: -1.9441,
    longitude: 30.0619,
    address: "KN 5 Ave, Kigali",
    district: "Gasabo",
    sector: "Remera"
  },
  deviceInfo: {
    deviceId: "TEST-DEVICE-123",
    deviceModel: "Test Device",
    osVersion: "Test OS 1.0",
    appVersion: "1.0.0-test"
  },
  priority: "low"
};
```

### Postman Collection
Import the Postman collection from: `/docs/postman/CivicSignal_IssueReporting.json`

---

## Rate Limits & Quotas

| Resource | Limit | Window |
|----------|-------|--------|
| Issue Creation | 10 requests | Per day per user |
| Photo Upload | 5 images | Per request |
| Photo Size | 10 MB | Per image |
| API Requests | 1000 requests | Per hour per user |

---

## Support & Questions

For questions or issues with the API:
- Email: dev@civicsignal.rw
- Slack: #mobile-dev channel
- Documentation: https://docs.civicsignal.rw

---

## Changelog

### v1.0.0 (2024-01-20)
- Initial release
- Issue creation with device verification
- Photo upload with compression
- 15 predefined categories
- Tracking number generation
- Rate limiting implementation
