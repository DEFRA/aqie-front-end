# UK Gov Notify Subscription Service - Acceptance Criteria

## Epic: Implement UK Gov Notify Subscription Service for Air Quality Notifications

### Story: Initial Setup and Integration

#### Acceptance Criteria

**AC1: Gov Notify Account & Service Setup**

- [ ] UK Gov Notify service account is created for DEFRA/AQIE
- [ ] Service is configured with appropriate branding (DEFRA logo, colours)
- [ ] API keys are generated for different environments (dev, staging, production)
- [ ] Template IDs are created for air quality notification emails/SMS:
  - Email subscription confirmation template
  - SMS subscription confirmation template (6-digit code + backup URL)
  - Daily air quality update template (email + SMS)
  - Air quality alert template (email + SMS)
  - Weekly summary template (email + SMS)
  - Unsubscribe confirmation template

**AC2: Secure Configuration Management**

- [ ] Environment variables are configured for Notify API credentials:
  - `NOTIFY_API_KEY` - API key for the current environment
  - `NOTIFY_BASE_URL` - Base URL for Notify API (defaults to production)
  - `NOTIFY_ENABLED` - Feature flag to enable/disable notifications
- [ ] No sensitive credentials are committed to source control
- [ ] Configuration validation exists to ensure required Notify settings are present

**AC3: Backend Service Integration**

- [ ] A new service module `src/server/services/notify-service.js` is created
- [ ] Service can authenticate with Gov Notify API using official Node.js client
- [ ] Service includes methods for:
  - Sending email notifications
  - Sending SMS notifications (if required)
  - Validating email addresses/phone numbers
  - Handling API rate limits and retries
- [ ] All Notify API errors are properly logged with structured logging

**AC4: Subscription Data Model**

- [ ] Database schema/data structure for storing user subscriptions:
  - User email address (required)
  - Phone number (optional for SMS, must be in international format `+447900900123`)
  - Location preferences (postcode, coordinates, or location ID)
  - Notification preferences (daily, alerts only, weekly summary)
  - Subscription status (active, paused, unsubscribed)
  - Created/updated timestamps
- [ ] Validation rules for subscription data:
  - Email: Standard email format validation
  - Phone: International format with `+` prefix, digits and `( ) + -` characters only
  - Location: Valid UK postcode or coordinates within service area

**AC4: Subscription Creation**

- [ ] Users can subscribe via email OR phone number
- [ ] Required fields:
  - Contact method: email address OR UK mobile number
  - Name: User's full name (optional but recommended)
  - Location: Valid UK postcode or coordinates within service area
- [ ] Subscription method selection (email/SMS) affects:
  - Confirmation flow (email link vs SMS code)
  - Notification delivery method
  - Validation requirements

### **SMS Subscription Requirements**

**SMS Channel Support:**

- [ ] Support UK mobile numbers only (Gov.UK Notify requirement)
- [ ] Validate and normalize phone numbers to +44 format
- [ ] Support alternative formats: 07xxx, +447xxx, 447xxx
- [ ] Reject non-UK or landline numbers with clear error messages

**SMS Confirmation Flow:**

- [ ] Generate 5-digit numeric confirmation codes for SMS
- [ ] SMS character limit compliance (160 chars max)
- [ ] Include backup URL link in SMS for accessibility
- [ ] Shorter expiry time for SMS codes (1 hour vs 24 hours for email)
- [ ] Two confirmation methods: code reply OR URL click

**SMS Rate Limiting:**

- [ ] Maximum 3 SMS confirmations per phone number per hour
- [ ] Maximum 3 code attempts per confirmation session
- [ ] Clear error messages for rate limit violations

**SMS Security:**

- [ ] Hash confirmation codes before database storage
- [ ] Timing-safe comparison for code verification
- [ ] Auto-delete expired SMS tokens
- [ ] Phone number masking in logs for GDPR compliance

**SMS Template Requirements:**

- [ ] Clear instructions for 5-digit code reply
- [ ] Include STOP opt-out instruction (compliance)
- [ ] Backup URL for accessibility
- [ ] Location name personalization
- [ ] Gov.UK branding compliance

**AC5: Basic API Endpoints**

- [ ] `POST /api/subscriptions/email` - Create email subscription (sends confirmation email)
- [ ] `POST /api/subscriptions/sms` - Create SMS subscription (sends confirmation SMS)
- [ ] `POST /api/subscriptions/sms/confirm` - Confirm SMS with 6-digit code
- [ ] `GET /subscription/confirm` - Email confirmation endpoint with token validation
- [ ] `GET /sms/confirm` - SMS URL confirmation endpoint (backup method)
- [ ] `GET /api/subscriptions/:id` - Retrieve subscription details
- [ ] `PUT /api/subscriptions/:id` - Update subscription preferences
- [ ] `DELETE /api/subscriptions/:id` - Unsubscribe user
- [ ] All endpoints include proper error handling and validation
- [ ] Confirmation flows include success/error pages for both email and SMS

**AC6: Security & Privacy**

- [ ] Email verification process for new subscriptions:
  - Generate cryptographically secure confirmation tokens
  - Send confirmation email with time-limited link (24 hours)
  - Confirmation link format: `/subscription/confirm?token={token}&email={email}`
  - Validate token and email on confirmation endpoint
  - Prevent duplicate confirmations and handle expired tokens
- [ ] SMS verification process for new subscriptions:
  - Generate 6-digit numeric codes with secure hashing
  - Send confirmation SMS with time-limited code (1 hour)
  - Include backup URL: `/sms/confirm?t={urlToken}&p={phone}&id={confirmationId}`
  - Validate code with timing-safe comparison
  - Maximum 3 attempts per code, 3 codes per hour per number
- [ ] Unsubscribe tokens are generated and validated
- [ ] Personal data handling complies with GDPR requirements
- [ ] Rate limiting on subscription endpoints to prevent abuse:
  - Max 5 email attempts per email per hour
  - Max 3 SMS attempts per phone number per hour
- [ ] Phone number masking in logs for privacy compliance

**AC7: Testing**

- [ ] Unit tests for notify service module (>90% coverage)
- [ ] Integration tests for subscription API endpoints
- [ ] Mock Notify API responses in tests (no real notifications sent)
- [ ] Test coverage includes error scenarios and edge cases
- [ ] Phone number validation tests cover:
  - Valid UK mobile numbers (`+447900900123`, `07900900123`)
  - Invalid formats (letters, wrong country codes, too many/few digits)
  - Landline numbers (should be rejected for SMS)
  - International numbers (should be rejected for Gov.UK Notify)
- [ ] SMS confirmation flow tests cover:
  - Valid 6-digit code confirmation
  - Invalid code attempts and rate limiting
  - Expired code handling
  - URL backup confirmation method
  - Code attempt counting and session expiry
  - Edge cases (spaces, brackets, hyphens in valid positions)

**AC8: Frontend Integration Points**

- [ ] Subscription form UI components are created
- [ ] Form validation for email/phone number format:
  - Email: Standard email validation
  - Phone: International format validation (`+` prefix, digits and `( ) + -` only)
  - Real-time validation feedback for user experience
- [ ] Success/error messaging for subscription actions
- [ ] Unsubscribe page with confirmation flow

**AC9: Monitoring & Logging**

- [ ] Notify API calls are logged with request/response details
- [ ] Metrics tracked for:
  - Subscription creation rate
  - Notification send success/failure rates
  - API response times
- [ ] Error alerting for failed notification sends

**AC10: Documentation**

- [ ] API documentation for subscription endpoints
- [ ] Setup guide for Gov Notify configuration
- [ ] User guide for subscription management
- [ ] Technical documentation for notification service architecture

### Definition of Done

- [ ] All acceptance criteria are met
- [ ] Code review completed and approved
- [ ] Unit and integration tests pass
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Feature tested in staging environment
- [ ] Performance impact assessed
- [ ] GDPR compliance reviewed

### Technical Notes

- Use the official `notifications-node-client` npm package for Gov Notify integration
- Implement exponential backoff for API retries
- Consider implementing a queue system for high-volume notifications
- Ensure email templates are accessible and follow Gov.UK design standards

### Dependencies

- Gov Notify service account approval
- Database schema changes (if using SQL)
- Environment configuration in deployment pipeline
- Legal review of privacy policy updates

### Risks & Mitigations

- **Risk**: Gov Notify API rate limits
  - **Mitigation**: Implement queuing and batching for high volumes
- **Risk**: Email deliverability issues
  - **Mitigation**: Monitor bounce rates and maintain clean email lists
- **Risk**: GDPR compliance
  - **Mitigation**: Implement proper consent mechanisms and data retention policies
