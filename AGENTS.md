# CivicSignal Engineering Remediation Guide

This document is a project-level audit of the current CivicSignal codebase and a checklist of the issues that must be addressed before the app can be considered production-safe. It is organized feature-by-feature, starting with authentication.

## Quick summary

The app currently contains a mix of:

- real backend API routes connected to MongoDB/Mongoose,
- UI pages that look complete and polished,
- but several flows that are intentionally mocked with `setTimeout(...)` instead of calling their real API handlers.

This creates a false sense of correctness: many screens appear to work, but they do not perform the actual logic required by the backend.

The most important concrete issues discovered include:

1. Authentication screens are not actually calling the backend for login, password reset, or verification.
2. Dynamic route typing is broken in a Next.js App Router route.
3. Some client-side validation is inconsistent with the backend rules.
4. Some flows are missing required parameters or are storing inconsistent values.
5. Several code paths are using placeholder logic or stale assumptions rather than real API responses.

---

## Verification status

The following checks were run during the audit:

- `npm run build` in the project root
- `npx tsc --noEmit`

Current TypeScript result:

- `npx tsc --noEmit` fails due to a route signature mismatch in the issue report dynamic route.
- This is a real compile-time issue and blocks a clean TypeScript/Next build.

---

## 1) Authentication: login, signup, verification, forgot password, reset password

### A. Login flow

Files involved:

- `src/app/auth/login/page.tsx`
- `src/app/api/auth/login/route.ts`
- `src/lib/api.ts`
- `src/lib/utils/auth.ts`

Issues found:

1. The login page has a design that looks complete, but the flow is not fully wired to the backend in a reliable way.
2. The login route in the backend does a real lookup, but the client is not consistently handling verification-required and invalid-credential responses.
3. In `src/lib/api.ts`, `authAPI.login()` logs `response.data` even though the API helper returns `response` directly. That is not a valid property on the result object and is a logic bug.
4. The login API normalizes email lookups incorrectly. In the route, `User.findOne({ email })` is used without converting to lowercase, while the signup route stores emails as lowercase. This can cause account lookup mismatch when a user enters uppercase variants.
5. In the verification redirect logic, `handleVerificationRedirect()` does not pass the phone contact when the phone is unverified. This causes a broken state when a user is only missing phone verification.
6. The login route checks for `!user.isEmailVerified || !user.isPhoneVerified` and sends users to verification, but the frontend does not always redirect with the correct URL parameters or contact values.

Required fix:

- Normalize login email input with `toLowerCase()` before sending to the backend.
- Keep the frontend redirect logic consistent with the server response, including both email and phone contact values.
- Remove invalid `response.data` logging and rely on the actual API response contract.
- Validate that the `requiresVerification` branch receives the `email` and `phone` values from the server and redirects correctly.

### B. Signup flow

Files involved:

- `src/app/auth/signup/page.tsx`
- `src/app/api/auth/register/route.ts`

Issues found:

1. Client-side password strength checks are inconsistent with the backend. The frontend accepts passwords with a strength threshold of `3` in some places; the backend requires all password rules in `validatePassword()` to pass, which is stricter.
2. The signup route is real and mostly correct, but the frontend flow still depends on a simulated redirect after registration. That is acceptable only if the API call succeeds and the UI uses the actual backend response. It should not assume success without checking result fields.
3. The signup route sends verification emails and SMS messages and stores the codes in the database, but the actual verification UI must be wired to those exact values and not to fake local states only.

Required fix:

- Align frontend validation with backend validation rules exactly.
- Treat registration as successful only when the API returns `success: true` and the expected payload.
- Ensure the redirect to the verification page includes both `email` and `phone` query params.

### C. Verify account flow

Files involved:

- `src/app/auth/verify-account/page.tsx`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/verify-phone/route.ts`

Issues found:

1. The verification page calls the real API endpoints, which is good, but there are logic issues in the UI state handling.
2. In `handleVerifyPhone`, the failure state clears the code with this value:

   ```ts
   setPhoneCode(["", "", "", "", ""]);
   ```

   This creates a 5-item array instead of a 6-item code array, which is a logic bug and can break the input UI and subsequent validation.

3. The code checks for both email and phone completion using local state, but the actual tokens are only created when both are verified in the backend. The redirect should only happen after both have been confirmed by the server, not just locally in the client.
4. Some timer and resend logic is correct, but the flow should also guard against uninitialized or empty `userEmail` / `userPhone` values before verifying.

Required fix:

- Standardize every 6-digit input array to length 6.
- Only redirect when both values are confirmed and the server response indicates success.
- Add safe guards for empty `email` and `phone` URL params before any verification call.
- Add handling for expired or invalid codes with a clear user message.

### D. Forgot password flow

Files involved:

- `src/app/auth/forgot-password/page.tsx`
- `src/app/api/auth/forgot-password/route.ts`

Issues found:

1. The forgot-password page does not call the actual API at all. It uses a fake `setTimeout` and navigates immediately.
2. The route in `src/app/api/auth/forgot-password/route.ts` is real and mostly correct, but it is never reached from the UI.
3. The route stores `passwordResetToken` and `passwordResetExpires` on the user, but there is no explicit client-side validation flow that uses the returned success state correctly.
4. The user can select email or phone, but the verification screen must include both the `method` and `contact` values as query parameters. Otherwise the code page cannot properly identify the contact destination.

Required fix:

- Replace the simulated submit with a real `authAPI.forgotPassword(identifier, method)` call.
- Only navigate to the verification page after the backend confirms the code was sent.
- Ensure the route builds with the correct identifier and method values.

### E. Verify code / OTP flow

Files involved:

- `src/app/auth/verify-code/page.tsx`
- backend reset flow

Issues found:

1. This page also uses a fake delay and redirects to the reset page without verifying the code against the server.
2. The `handleSubmit` function only checks that six digits are entered and then redirects. It never sends the OTP to the backend.
3. The `handleResendCode` function is also fake and never calls the resend API.
4. The page reads `method` and `contact` from the URL but the forgot-password and login flows do not consistently provide the `contact` field for phone verification.

Required fix:

- Implement actual OTP verification against the backend before allowing password reset.
- Reuse the actual API contract, not timer-based simulated navigation.
- Ensure code resend uses the same API as the auth flow and refreshes the token on the user record.

### F. Reset password flow

Files involved:

- `src/app/auth/reset-password/page.tsx`
- `src/app/api/auth/reset-password/route.ts`

Issues found:

1. The reset-password page is also a fake flow: it only waits 2 seconds and pushes to confirmation.
2. It never passes the `identifier`, `resetCode`, `newPassword`, or `method` to the API.
3. The backend route expects those values and validates against `passwordResetToken` and `passwordResetExpires`.
4. The client must include the identifier used to reset the password (email or phone) and the code entered by the user. Without that, the server returns an invalid reset-code error.

Required fix:

- Submit real data to `authAPI.resetPassword(identifier, resetCode, newPassword, method)`.
- Read the identifier and code from the verification flow and keep them in state or URL params.
- Validate the new password on the client and server before sending.

---

## 2) TypeScript and Next.js route issues

### A. Dynamic route params type mismatch

File involved:

- `src/app/api/issues/report/[id]/route.ts`

Issue:

The route is declared like this:

```ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
);
```

In Next.js 16 / App Router, route params are typed as a Promise and are awaited before use. The compiler is currently failing with a mismatch between `{ params: { id: string } }` and the newer required contract `{ params: Promise<{ id: string }> }`.

Current verified error:

- `npx tsc --noEmit` fails because of this route signature mismatch.

Required fix:

```ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
}
```

This must be applied to all dynamic routes that read `params` in the same pattern.

---

## 3) API utility issues

File involved:

- `src/lib/api.ts`

Issues found:

1. `authAPI.login()` logs `response.data`, but `response` is not expected to have a `data` property. This is a bug and can mask actual response data.
2. `apiCall()` throws errors by reading `response.json()` from failed responses, but the verification-required error is handled in a partial way. This could produce inconsistent error objects depending on API response format.
3. Some auth flows rely on `window.location.href` for redirects after failed refresh, which is not ideal for a Next.js client app but is not necessarily wrong if done intentionally.

Required fix:

- Standardize all API response handling around a single contract: `{ success, ... }` and consistent errors.
- Remove debug `console.log` statements from production auth code.
- Centralize redirect behavior in `router.push` or a structured auth context rather than direct `window.location` manipulation.

---

## 4) Data consistency and normalization issues

Issues found:

1. Emails are lowercased in some places but not all: login route should lower-case, forgot password should lower-case, verification and reset flows should normalize user input before querying.
2. Phone numbers are sanitized in some places (`replace(/\s/g, '')`) but not others. The app must use one consistent sanitization strategy across signup, login, forgot password, and verification flows.
3. Some account flows check `!user.isActive` and return a generic message, but the UI does not always show a user-friendly response for locked or inactive accounts.

Required fix:

- Add shared normalization helpers for phone and email before queries and sends.
- Use a central sanitizer for all auth routes.
- Treat identity and contact normalization as part of the auth contract.

---

## 5) Feature-level notes beyond auth

These areas were also reviewed and should be fixed as part of the same cleanup cycle.

### A. Agency registration

Files involved:

- `src/app/auth/agency-registration/page.tsx`
- `src/app/api/auth/register-agency/route.ts`

Findings:

- This flow depends on valid verified state and token handling.
- It does a token check from URL parameters and writes them into localStorage, which can work but needs to be consistent with the app’s auth strategy.
- Any auth state should be managed in a single place to prevent token drift or stale state across pages.

### B. Admin and dashboard flows

Files involved:

- `src/app/admin/**`
- `src/app/dashboard/**`

Findings:

- Some admin screens use alerts and simulated actions rather than robust API-driven patterns.
- Several `TODO` comments indicate incomplete implementations that need formal API contracts and real backend behavior.

### C. Reporting and issue APIs

Files involved:

- `src/app/api/issues/**`
- related issue pages

Findings:

- The route signature issue is the clearest TypeScript blocker and must be fixed first.
- The code should also be reviewed for route-specific business logic and permissions checks.

---

## Recommended remediation order

1. Fix all TypeScript/Next compile errors.
   - Start with the dynamic route in `src/app/api/issues/report/[id]/route.ts`.
2. Repair the real auth flow.
   - Fix login, signup, verify account, forgot password, verify code, and reset password.
3. Normalize input handling.
   - Email lowercasing and phone sanitization across all auth endpoints.
4. Create a single consistent API contract.
   - Standardize success/error payloads and ensure client handling matches them.
5. Remove simulator logic.
   - Replace all `setTimeout` mock navigation states with real backend API success conditions.
6. Re-run build and lint after each group of fixes.

---

## Final note

The app is close to having a working authentication architecture, but the current state includes a large number of flows that are visually implemented without being functionally connected to real backend actions. The highest-priority risk is not just UI polish; it is that users can reach screens that appear valid while the actual OTP, verification, and reset logic never occur.

The next step is to treat the auth flows as the primary fix target and then move outward to agency registration, dashboard logic, and reporting.
