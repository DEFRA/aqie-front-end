# Mock OTP Setup for Local Development

## Problem

GOV.UK Notify has limits in trial mode:

- 50 SMS per day per service
- SMS can only be sent to whitelisted team members
- Backend may return `otp_generated_notification_failed` when limits are hit

## Solution

The application provides a mock OTP mode that **bypasses the backend service entirely** for local development and testing.

## How It Works

### 1. Configuration (`src/config/local.json`)

```json
"notify": {
  "enabled": true,
  "mockOtpEnabled": true,
  "mockOtpCode": "12345",
  ...
}
```

### 2. Mock Mode Behavior

When `mockOtpEnabled: true`:

1. **Backend service is still called** - Failures do not block local verification
2. **Mock OTP code is used** - The configured code (default: `12345`) is stored in session
3. **Server logs show**: `Mock OTP enabled, backend still called`

When `mockOtpEnabled: false`:

1. **Backend service is called** - Normal SMS flow via GOV.UK Notify
2. **Real OTP sent via SMS** - User receives actual text message
3. **Verification via backend API** - Real service validates the code

### 3. Mock OTP Flow

When mock mode is enabled:

- No backend API call is made
- Mock OTP code (`12345`) is stored in session
- Server logs show: `Mock OTP enabled, bypassing backend service { mockOtpCode: '12345' }`
- User enters `12345` on verification page
- Verification succeeds against session value

### 4. Real Service Flow

When mock mode is disabled:

- SMS sent via GOV.UK Notify backend
- User receives real code via SMS
- User enters code from SMS
- Verification happens via backend API

## Usage

### Enable Mock OTP

#### Local Development (`src/config/local.json`):

```json
"mockOtpEnabled": true
```

#### Test Environment on CDP (Environment Variables):

Set these environment variables in your CDP deployment:

```bash
NOTIFY_MOCK_OTP_ENABLED=true
NOTIFY_MOCK_OTP_CODE=12345
```

Or add to `.env` file:

```dotenv
NOTIFY_MOCK_OTP_ENABLED=true
NOTIFY_MOCK_OTP_CODE=12345
```

### Disable Mock OTP

#### Local Development:

In `src/config/local.json`:

```json
"mockOtpEnabled": false
```

#### Test Environment:

```bash
NOTIFY_MOCK_OTP_ENABLED=false
```

Or remove/comment out the environment variable entirely.

### Change Mock Code

#### Local Development:

In `src/config/local.json`:

```json
"mockOtpCode": "99999"
```

#### Test Environment:

```bash
NOTIFY_MOCK_OTP_CODE=99999
```

## Testing

1. Start the server: `npm run dev`
2. Go to SMS registration flow
3. Click "Agree and continue" to send OTP
4. Check server logs:
   - Mock mode: `Using mock OTP for local development`
   - Real service: `Queued Notify SMS for delivery`
5. Enter the code:
   - Mock mode: Enter `12345` (or your configured mock code)
   - Real service: Enter code from SMS

## Important Notes

- **Mock OTP does not bypass alert registration** - It only affects OTP verification, not alert setup
- **Alert setup mocking is separate** - Use `notify.mockSetupAlertEnabled` if you want to mock alert registration
- **No code changes needed** - Just toggle config setting
- **Session-based** - Mock OTP stored securely in encrypted session
- **Development only** - Production config should have `mockOtpEnabled: false`
- **Toggle at will** - Switch between mock and real service by changing config

## Server Logs

### Mock Mode Active

```
Mock OTP enabled, bypassing backend service { mockOtpCode: '12345' }
```

### Real Service Working

```
Response status for https://...aqie-notify-service/subscribe/generate-otp: 201
Notify message sent successfully
Queued Notify SMS for delivery
```

### Verification (Mock)

```
Verifying against mock OTP { otpMatches: true }
```

## Production Setup

In production config, ensure mock OTP is disabled:

**Environment Variables:**

```bash
NOTIFY_MOCK_OTP_ENABLED=false
# Or simply don't set it (defaults to false)
```

**Config file (if used):**

```json
"notify": {
  "enabled": true,
  "mockOtpEnabled": false
}
```

This ensures mock OTP is never used in production environments.

## Alert Registration Mocking (Optional)

If you need to mock alert registration (instead of writing to the real backend), enable mock setup alerts:

```bash
NOTIFY_MOCK_SETUP_ALERT_ENABLED=true
```

To keep real alert registration while still mocking OTP, leave it unset or `false`.

## Deployment Instructions for Testers

### For CDP Test Environment

1. **Access CDP Portal** and navigate to your service configuration

2. **Add Environment Variables**:
   - Go to your service's environment variables section
   - Add: `NOTIFY_MOCK_OTP_ENABLED=true`
   - Add: `NOTIFY_MOCK_OTP_CODE=12345` (optional, defaults to 12345)

3. **Redeploy** the service for changes to take effect

4. **Test the flow**:
   - Go through SMS registration
   - With mock enabled, backend service is bypassed
   - Enter `12345` to verify successfully

5. **Monitor logs** to confirm mock mode:
   ```
   Mock OTP enabled, bypassing backend service { mockOtpCode: '12345' }
   ```

### To Use Real Service

Disable mock mode:

- Set `NOTIFY_MOCK_OTP_ENABLED=false` or remove the variable
- Redeploy the service
- Real backend service will be called for SMS sending and verification

### To Disable Mock Mode

Remove or set to false:

```bash
NOTIFY_MOCK_OTP_ENABLED=false
```

Then redeploy the service.
