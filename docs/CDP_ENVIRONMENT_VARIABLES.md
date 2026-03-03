# CDP Environment Variables Reference

This document lists environment variables that can be configured in the CDP test environment.

## Mock OTP Configuration (For Test Environment)

When GOV.UK Notify hits the 50 SMS per day limit or returns `otp_generated_notification_failed`, the application can automatically fall back to mock OTP mode.

### Required Environment Variables

| Variable                  | Required | Default | Description                                      |
| ------------------------- | -------- | ------- | ------------------------------------------------ |
| `NOTIFY_MOCK_OTP_ENABLED` | No       | `false` | Enable mock OTP fallback when real service fails |
| `NOTIFY_MOCK_OTP_CODE`    | No       | `12345` | The mock OTP code to use in mock mode            |

### How It Works

1. **Always tries real service first** - Every OTP request goes to GOV.UK Notify backend
2. **Automatic fallback** - If backend fails or returns `otp_generated_notification_failed`, switches to mock mode
3. **Automatic recovery** - When real service works again, automatically switches back
4. **Test-only feature** - Should never be enabled in production

### Setup Instructions

#### Enable Mock OTP in CDP Test Environment

1. Navigate to service configuration in CDP Portal
2. Add environment variables:
   ```bash
   NOTIFY_MOCK_OTP_ENABLED=true
   NOTIFY_MOCK_OTP_CODE=12345
   ```
3. Save and redeploy service
4. Verify in logs: `Using mock OTP for local development`

#### Disable Mock OTP

1. Set to false or remove variable:
   ```bash
   NOTIFY_MOCK_OTP_ENABLED=false
   ```
2. Redeploy service

### Testing

With mock OTP enabled in test environment:

1. User enters phone number
2. Clicks "Send activation code"
3. If GOV.UK Notify fails:
   - System logs: `SMS service failed or returned otp_generated_notification_failed, using mock OTP`
   - Mock OTP stored in session: `12345`
4. User enters `12345` on verification page
5. Verification succeeds against mock OTP

### Production Configuration

**IMPORTANT**: Mock OTP must be disabled in production environments.

```bash
# Production - DO NOT enable mock OTP
NOTIFY_MOCK_OTP_ENABLED=false
```

Or simply don't set the variable (defaults to `false`).

## Other Notify Configuration

| Variable                 | Default                                                        | Description                            |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------- |
| `NOTIFY_ENABLED`         | `false`                                                        | Enable/disable notify service entirely |
| `NOTIFY_BASE_URL`        | `https://aqie-notify-service.test.cdp-int.defra.cloud`         | Backend notify service URL             |
| `ALERT_BACKEND_BASE_URL` | `https://aqie-alert-back-end-service.test.cdp-int.defra.cloud` | Alert backend service URL              |
| `NOTIFY_SMS_PATH`        | `/subscribe/generate-otp`                                      | API path for generating OTP            |
| `NOTIFY_VERIFY_OTP_PATH` | `/subscribe/validate-otp`                                      | API path for verifying OTP             |

## Related Documentation

- See `MOCK_OTP_SETUP.md` for detailed implementation details
- See `.env.example` for complete list of environment variables
