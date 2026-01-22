# Mock OTP Setup for Local Development

## Problem

GOV.UK Notify has limits in trial mode:

- 50 SMS per day per service
- SMS can only be sent to whitelisted team members
- Backend may return `otp_generated_notification_failed` when limits are hit

## Solution

The application now automatically falls back to mock OTP when the real service fails.

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

### 2. Automatic Fallback Logic

1. **Always tries real service first** - Sends request to backend
2. **Falls back to mock** if:
   - Backend returns error
   - Backend returns `{ status: "otp_generated_notification_failed" }`
3. **Automatically uses real service** when it's working again

### 3. Mock OTP Flow

When mock mode activates:

- Mock OTP code (`12345`) is stored in session
- Server logs show: `Using mock OTP for local development`
- User enters `12345` on verification page
- Verification succeeds against session value

### 4. Real Service Flow

When real service works:

- SMS sent via GOV.UK Notify
- Mock OTP cleared from session
- User enters real code from SMS
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

- **Mock is only a fallback** - Real service is always tried first
- **No code changes needed** - Just toggle config setting
- **Automatic detection** - Switches to real service when available
- **Session-based** - Mock OTP stored securely in encrypted session
- **Development only** - Production config should have `mockOtpEnabled: false`

## Server Logs

### Mock Mode Active

```
SMS service failed or returned otp_generated_notification_failed, using mock OTP
Using mock OTP for local development { mockOtpCode: '12345' }
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
   - When GOV.UK Notify fails (50 SMS limit or otp_generated_notification_failed)
   - System automatically uses mock OTP: `12345`
   - Enter `12345` to verify successfully

5. **Monitor logs** to confirm mock mode:
   ```
   SMS service failed or returned otp_generated_notification_failed, using mock OTP
   Using mock OTP for local development { mockOtpCode: '12345' }
   ```

### When GOV.UK Notify Works Again

No action needed! The system:

- Always tries real service first
- Automatically switches back when real service succeeds
- Mock only activates as fallback

### To Disable Mock Mode

Remove or set to false:

```bash
NOTIFY_MOCK_OTP_ENABLED=false
```

Then redeploy the service.
