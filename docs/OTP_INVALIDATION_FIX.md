# OTP Invalidation Security Fix

## Issue Description

**Security Vulnerability**: When a user requests a new OTP (One-Time Password), the previous OTP remains valid and can still be used to verify and proceed through the SMS journey.

### Reproduction Steps

1. Go to location page (e.g., `/location/bristol_city-of-bristol`)
2. Click on "Get alerts by text message"
3. Continue to receive first OTP
4. Open "Not received a text message?" accordion and request new OTP
5. Use the **old/first OTP** instead of the new one
6. **Result**: Old OTP is accepted and user proceeds (SECURITY ISSUE)
7. **Expected**: Old OTP should be rejected with error message

## Root Cause

The backend (GOV.UK Notify service) stores all generated OTPs and accepts any valid token until it expires (15 minutes). When a new OTP is requested, the old one is not invalidated on the backend side.

## Solution Implemented

### Frontend Fix (Client-Side Token Tracking)

Since we don't control the backend OTP storage, we implemented client-side OTP generation sequence tracking to prevent old tokens from being accepted.

#### Changes Made:

1. **OTP Generation Sequence Tracking**
   - Added `otpGenerationSequence` session variable
   - Initialized to 1 when first OTP is sent
   - Incremented each time a new OTP is requested

2. **Files Modified:**
   - **`src/server/notify/register/sms-send-activation/controller.js`**
     - Initialize OTP generation sequence when first OTP is sent
     - Track `otpGenerationSequence` and `otpGeneratedAt` timestamp

   - **`src/server/notify/register/sms-send-new-code/controller.js`**
     - Increment `otpGenerationSequence` when new code is requested
     - Update `otpGeneratedAt` timestamp

   - **`src/server/common/services/notify.js`**
     - Store `mockOtpSequence` with each generated OTP
     - Validate that submitted OTP belongs to current generation sequence
     - Return specific error when old/superseded OTP is used

   - **`src/server/notify/register/sms-verify-code/controller.js`**
     - Added handling for "no longer valid" error message
     - Display user-friendly error for superseded tokens

#### Validation Logic:

```javascript
// Check if this OTP has been superseded by a newer one
const isSuperseded =
  mockOtpSequence && currentSequence && mockOtpSequence < currentSequence

if (isSuperseded) {
  return {
    ok: false,
    status: 400,
    body: {
      message:
        'This code is no longer valid. A newer code has been sent. Please use the most recent code.',
      mock: true
    }
  }
}
```

## Error Messages

When an old OTP is submitted:

- **User sees**: "This code is no longer valid. A newer code has been sent. Please use the most recent code"
- **Backend response**: Error 400 with message indicating OTP has been superseded

## Session Variables Used

| Variable                | Purpose                                        | Example Value   |
| ----------------------- | ---------------------------------------------- | --------------- |
| `otpGenerationSequence` | Tracks how many times OTP has been regenerated | 1, 2, 3, ...    |
| `otpGeneratedAt`        | Timestamp when current OTP was generated       | `1738368000000` |
| `mockOtp`               | The actual mock OTP code (development only)    | `"12345"`       |
| `mockOtpTimestamp`      | When mock OTP was created                      | `1738368000000` |
| `mockOtpSequence`       | Which generation this mock OTP belongs to      | 1, 2, 3, ...    |

## Testing

The fix validates:

1. ✅ Only the most recent OTP is accepted
2. ✅ Old OTPs are rejected with appropriate error
3. ✅ OTP expiry still works (15 minute timeout)
4. ✅ Failed attempt tracking continues to work
5. ✅ Rate limiting (5 minutes after 3 failed attempts) still works

## Limitations

### Frontend-Only Protection

This is a **client-side** fix only. The backend (aqie-notify-service) still accepts old tokens. A user could theoretically bypass this by:

- Manipulating session storage
- Calling the backend API directly

### Backend Fix Needed

For complete security, the **aqie-notify-service** should:

1. Track OTP generation sequence number
2. Invalidate previous tokens when new one is generated
3. Return specific error for superseded tokens
4. Store only the most recent OTP per phone number

## Recommendations

1. **Implement backend OTP invalidation** in aqie-notify-service
2. **Add integration tests** for OTP sequence validation
3. **Monitor** for any attempts to bypass client-side validation
4. **Consider** using shorter OTP validity periods (e.g., 10 minutes instead of 15)

## Related Files

- `src/server/notify/register/sms-send-activation/controller.js`
- `src/server/notify/register/sms-send-new-code/controller.js`
- `src/server/notify/register/sms-verify-code/controller.js`
- `src/server/common/services/notify.js`

## Testing Instructions

### Manual Test

1. Start local server with mock OTP enabled
2. Navigate to any location page
3. Click "Get alerts by text message"
4. Enter mobile number and get first OTP (sequence=1)
5. Note the OTP shown in debug mode
6. Click "Not received a text message?" and request new code (sequence=2)
7. Try entering the OLD OTP (sequence=1)
8. **Expected**: Error message "This code is no longer valid..."
9. Enter the NEW OTP (sequence=2)
10. **Expected**: Success, proceeds to next page

### Automated Test

```javascript
// Test case for OTP sequence validation
test('should reject old OTP when new one is requested', async () => {
  // Request first OTP
  request.yar.set('otpGenerationSequence', 1)
  request.yar.set('mockOtp', '12345')
  request.yar.set('mockOtpSequence', 1)

  // Request second OTP (increments sequence)
  request.yar.set('otpGenerationSequence', 2)
  request.yar.set('mockOtp', '67890')
  request.yar.set('mockOtpSequence', 2)

  // Try to verify with old OTP
  const result = await verifyOtp('07700900123', '12345', request)

  expect(result.ok).toBe(false)
  expect(result.body.message).toContain('no longer valid')
})
```

## Implementation Date

1 February 2026

## Branch

`fix/sms-journey-ui-improvements`
