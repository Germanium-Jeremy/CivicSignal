# CivicSignal Authentication Pages

This directory contains all authentication-related pages for the CivicSignal application.

## Pages Overview

### 1. Login (`/auth/login`)
- **Purpose**: User sign-in
- **Features**: 
  - Email/password authentication
  - Remember me functionality
  - Social login (Google, Facebook, Apple)
  - Password visibility toggle
  - Form validation
- **Navigation**: Links to signup and forgot password

### 2. Signup (`/auth/signup`)
- **Purpose**: New user registration
- **Features**:
  - Full name, email, and phone collection
  - Password strength indicator
  - Password confirmation validation
  - Terms of service agreement
  - Newsletter subscription option
  - Social signup options
- **Navigation**: Links to login page

### 3. Forgot Password (`/auth/forgot-password`)
- **Purpose**: Password recovery initiation
- **Features**:
  - Choice between email or SMS verification
  - Contact method selection UI
  - Input validation
  - Help information
- **Navigation**: Back to login, proceeds to verify-code

### 4. Verify Code (`/auth/verify-code`)
- **Purpose**: Verification code input for password reset
- **Features**:
  - 6-digit code input with auto-focus
  - Paste support for codes
  - Resend functionality with timer
  - Contact method display (masked)
  - Auto-verification when code is complete
- **Navigation**: Back to forgot-password, proceeds to reset-password

### 5. Reset Password (`/auth/reset-password`)
- **Purpose**: Setting new password after verification
- **Features**:
  - Password strength requirements
  - Real-time validation feedback
  - Password confirmation
  - Security tips
  - Visual requirement checklist
- **Navigation**: Back to verify-code, proceeds to confirmation

### 6. Verify Account (`/auth/verify-account`)
- **Purpose**: Email and phone verification for new accounts
- **Features**:
  - Dual verification (email + phone)
  - Progress indicators
  - Auto-verification when codes are complete
  - Individual resend timers
  - Visual verification status
- **Navigation**: Back to signup, proceeds to confirmation

### 7. Confirmation (`/auth/confirmation`)
- **Purpose**: Success confirmation for various auth actions
- **Features**:
  - Dynamic content based on action type
  - Animated success indicators
  - Context-specific next steps
  - Quick action buttons
  - Additional information panels
- **Types**: 
  - `password-reset`: Password successfully reset
  - `account-verified`: Account verification complete
  - `signup-complete`: Registration successful

## Shared Components

### AuthLayout (`/components/auth/AuthLayout.tsx`)
- **Purpose**: Consistent layout for all auth pages
- **Features**:
  - Responsive design
  - Animated background elements
  - Logo and branding
  - Back button support
  - Footer information

## Design Features

### Responsive Design
- **Mobile-first approach**
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Touch-friendly interfaces**
- **Optimized spacing and typography**

### Visual Elements
- **Gradient backgrounds**
- **Animated elements**
- **Consistent color scheme**
- **Professional typography**
- **Interactive hover effects**

### User Experience
- **Clear navigation flow**
- **Helpful error messages**
- **Loading states**
- **Progress indicators**
- **Accessibility features**

## Navigation Flow

```
Landing Page
    ↓
Login ←→ Signup
    ↓         ↓
Dashboard   Verify Account
              ↓
          Confirmation

Forgot Password Flow:
Login → Forgot Password → Verify Code → Reset Password → Confirmation → Login
```

## Technical Implementation

### State Management
- React hooks for local state
- Form validation
- Loading states
- Timer management

### Routing
- Next.js App Router
- Dynamic navigation based on user actions
- URL parameters for context passing

### Styling
- Tailwind CSS
- Responsive utilities
- Custom animations
- Consistent design tokens

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
