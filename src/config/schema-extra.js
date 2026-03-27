const EXTRA_CONFIG_SCHEMA = {
  notify: {
    enabled: {
      doc: 'Enable Notify API integration',
      format: Boolean,
      default: false,
      env: 'NOTIFY_ENABLED'
    },
    baseUrl: {
      doc: 'Notify service base URL',
      format: String,
      default: 'https://aqie-notify-service.test.cdp-int.defra.cloud',
      env: 'NOTIFY_BASE_URL'
    },
    alertBackendBaseUrl: {
      doc: 'Alert backend service base URL',
      format: String,
      default: 'https://aqie-alert-back-end-service.test.cdp-int.defra.cloud',
      env: 'ALERT_BACKEND_BASE_URL'
    },
    smsPath: {
      doc: 'Notify API path for generating OTP',
      format: String,
      default: '/subscribe/generate-otp',
      env: 'NOTIFY_SMS_PATH'
    },
    verifyOtpPath: {
      doc: 'Notify API path for validating OTP',
      format: String,
      default: '/subscribe/validate-otp',
      env: 'NOTIFY_VERIFY_OTP_PATH'
    },
    emailPath: {
      doc: 'Notify API path for sending verification email',
      format: String,
      default: '/send-email-code',
      env: 'NOTIFY_EMAIL_PATH'
    },
    emailGenerateLinkPath: {
      doc: 'Notify API path for generating email confirmation links',
      format: String,
      default: '/subscribe/generate-link',
      env: 'NOTIFY_EMAIL_GENERATE_LINK_PATH'
    },
    emailValidateLinkPath: {
      doc: 'Notify API path for validating email confirmation links',
      format: String,
      default: '/subscribe/validate-link',
      env: 'NOTIFY_EMAIL_VALIDATE_LINK_PATH'
    },
    setupAlertPath: {
      doc: 'Alert backend path to create subscriptions',
      format: String,
      default: '/setup-alert',
      env: 'NOTIFY_SETUP_ALERT_PATH'
    },
    getSubscriptionsPath: {
      doc: 'Alert backend path to fetch subscriptions',
      format: String,
      default: '/api/subscriptions',
      env: 'NOTIFY_GET_SUBSCRIPTIONS_PATH'
    },
    mockOtpEnabled: {
      doc: 'Enable OTP mock fallback',
      format: Boolean,
      default: false,
      env: 'NOTIFY_MOCK_OTP_ENABLED'
    },
    mockOtpCode: {
      doc: 'OTP code used when mock OTP mode is enabled',
      format: String,
      default: '12345',
      env: 'NOTIFY_MOCK_OTP_CODE'
    },
    mockSetupAlertEnabled: {
      doc: 'Enable setup-alert mock responses',
      format: Boolean,
      default: false,
      env: 'NOTIFY_MOCK_SETUP_ALERT_ENABLED'
    },
    mockSubscriptionCheckMaxReached: {
      doc: 'Force subscription-check max-reached mock response',
      format: Boolean,
      default: false,
      env: 'NOTIFY_MOCK_SUBSCRIPTION_CHECK_MAX_REACHED'
    },
    smsMobileNumberPath: {
      doc: 'Frontend route: SMS mobile number page',
      format: String,
      default: '/notify/register/sms-mobile-number',
      env: 'NOTIFY_SMS_MOBILE_NUMBER_PATH'
    },
    smsVerifyCodePath: {
      doc: 'Frontend route: SMS verify code page',
      format: String,
      default: '/notify/register/sms-verify-code',
      env: 'NOTIFY_SMS_VERIFY_CODE_PATH'
    },
    smsSendActivationPath: {
      doc: 'Frontend route: SMS send activation page',
      format: String,
      default: '/notify/register/sms-send-activation',
      env: 'NOTIFY_SMS_SEND_ACTIVATION_PATH'
    },
    smsConfirmDetailsPath: {
      doc: 'Frontend route: SMS confirm details page',
      format: String,
      default: '/notify/register/sms-confirm-details',
      env: 'NOTIFY_SMS_CONFIRM_DETAILS_PATH'
    },
    smsSuccessPath: {
      doc: 'Frontend route: SMS success page',
      format: String,
      default: '/notify/register/sms-success',
      env: 'NOTIFY_SMS_SUCCESS_PATH'
    },
    smsMaxAlertsPath: {
      doc: 'Frontend route: SMS max alerts page',
      format: String,
      default: '/notify/register/sms-max-alerts',
      env: 'NOTIFY_SMS_MAX_ALERTS_PATH'
    },
    duplicateSubscriptionPath: {
      doc: 'Frontend route: duplicate subscription page',
      format: String,
      default: '/notify/register/duplicate-subscription',
      env: 'NOTIFY_DUPLICATE_SUBSCRIPTION_PATH'
    },
    emailDetailsPath: {
      doc: 'Frontend route: email details page',
      format: String,
      default: '/notify/register/email-details',
      env: 'NOTIFY_EMAIL_DETAILS_PATH'
    },
    emailVerifyEmailPath: {
      doc: 'Frontend route: email verify page',
      format: String,
      default: '/notify/register/email-verify-email',
      env: 'NOTIFY_EMAIL_VERIFY_EMAIL_PATH'
    },
    emailSendActivationPath: {
      doc: 'Frontend route: email send activation page',
      format: String,
      default: '/notify/register/email-send-activation',
      env: 'NOTIFY_EMAIL_SEND_ACTIVATION_PATH'
    },
    alertsSuccessPath: {
      doc: 'Frontend route: alerts success page',
      format: String,
      default: '/notify/register/alerts-success',
      env: 'NOTIFY_ALERTS_SUCCESS_PATH'
    },
    emailDuplicatePath: {
      doc: 'Frontend route: email duplicate subscription page',
      format: String,
      default: '/notify/register/email-duplicate',
      env: 'NOTIFY_EMAIL_DUPLICATE_PATH'
    },
    unsubscribeEmailLinkPath: {
      doc: 'Frontend route: unsubscribe email link page',
      format: String,
      default: '/notify/unsubscribe-email-link',
      env: 'NOTIFY_UNSUBSCRIBE_EMAIL_LINK_PATH'
    }
  },
  subscriptionApi: {
    enabled: {
      doc: 'Enable subscription capture API (for recording SMS/email captures)',
      format: Boolean,
      default: false,
      env: 'SUBSCRIPTION_API_ENABLED'
    },
    baseUrl: {
      doc: 'Subscription API base URL',
      format: String,
      default: '',
      env: 'SUBSCRIPTION_API_BASE_URL'
    },
    apiKey: {
      doc: 'Subscription API authentication key',
      format: String,
      default: '',
      env: 'SUBSCRIPTION_API_KEY',
      sensitive: true
    },
    emailPath: {
      doc: 'API path for recording email captures',
      format: String,
      default: '/capture/email',
      env: 'SUBSCRIPTION_API_EMAIL_PATH'
    },
    smsPath: {
      doc: 'API path for recording SMS captures',
      format: String,
      default: '/capture/sms',
      env: 'SUBSCRIPTION_API_SMS_PATH'
    },
    timeoutMs: {
      doc: 'Request timeout in milliseconds',
      format: 'int',
      default: 5000,
      env: 'SUBSCRIPTION_API_TIMEOUT_MS'
    }
  },
  postcodeNortherIrelandUrl: {
    doc: 'Search postcode Northern Ireland url',
    format: String,
    default: 'https://api.postcodes.io/postcodes?q=',
    env: 'POSTCODE_NORTHERN_IRELAND_URL'
  },
  oauthTokenUrlNIreland: {
    doc: 'Search postcode Northern Ireland oauth token url',
    format: String,
    default: 'https://login.microsoftonline.com',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_OAUTH_TOKEN_URL'
  },
  oauthTokenNorthernIrelandTenantId: {
    doc: 'oauthToken Northern Ireland tenant id',
    format: '*',
    sensitive: true,
    default: '',
    env: 'OAUTH_TOKEN_NORTHERN_IRELAND_API_TENANT_ID'
  },
  osPlacesApiPostcodeNorthernIrelandUrl: {
    doc: 'Search postcode Northern Ireland with osPlaces url',
    format: String,
    default: '',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL'
  },
  mockOsPlacesApiPostcodeNorthernIrelandUrl: {
    doc: 'Search postcode Northern Ireland with Mock osPlaces url',
    format: String,
    default: 'http://localhost:5000/results?postcode='
  },
  redirectUriNIreland: {
    doc: 'Redirect URI for Northern Ireland',
    format: String,
    default: 'https://aqie-front-end.dev.cdp-int.defra.cloud',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_REDIRECT_URI'
  },
  clientIdNIreland: {
    doc: 'OS Name Places Postcode Northern Ireland client id',
    format: '*',
    sensitive: true,
    default: '',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_ID'
  },
  clientSecretNIreland: {
    doc: 'OS Name Places Postcode Northern Ireland client secret',
    format: '*',
    sensitive: true,
    default: '',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SECRET'
  },
  niApiTimeoutMs: {
    doc: 'Timeout in milliseconds for Northern Ireland API calls',
    format: Number,
    default: 15000,
    env: 'NI_API_TIMEOUT_MS'
  },
  niApiMaxRetries: {
    doc: 'Maximum number of retries for Northern Ireland API calls',
    format: Number,
    default: 2,
    env: 'NI_API_MAX_RETRIES'
  },
  niApiRetryDelayMs: {
    doc: 'Delay in milliseconds between retries for Northern Ireland API calls',
    format: Number,
    default: 500,
    env: 'NI_API_RETRY_DELAY_MS'
  },
  niApiCacheEnabled: {
    doc: 'Enable caching for Northern Ireland API responses',
    format: Boolean,
    default: true,
    env: 'NI_API_CACHE_ENABLED'
  },
  niApiCacheTtlMs: {
    doc: 'Cache TTL in milliseconds for Northern Ireland API responses',
    format: Number,
    default: 600000,
    env: 'NI_API_CACHE_TTL_MS'
  },
  niApiCircuitBreakerEnabled: {
    doc: 'Enable circuit breaker for Northern Ireland API calls',
    format: Boolean,
    default: true,
    env: 'NI_API_CIRCUIT_BREAKER_ENABLED'
  },
  niApiCircuitBreakerFailureThreshold: {
    doc: 'Number of failures before circuit breaker opens for Northern Ireland API',
    format: Number,
    default: 3,
    env: 'NI_API_CIRCUIT_BREAKER_FAILURE_THRESHOLD'
  },
  niApiCircuitBreakerOpenMs: {
    doc: 'Duration in milliseconds the circuit breaker stays open for Northern Ireland API',
    format: Number,
    default: 60000,
    env: 'NI_API_CIRCUIT_BREAKER_OPEN_MS'
  },
  scopeNIreland: {
    doc: 'OS Name Places Postcode Northern Ireland client scope',
    format: '*',
    sensitive: true,
    default: '',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE'
  },
  redis: {
    host: {
      doc: 'Redis cache host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_HOST'
    },
    username: {
      doc: 'Redis cache username',
      format: String,
      default: '',
      env: 'REDIS_USERNAME'
    },
    password: {
      doc: 'Redis cache password',
      format: '*',
      default: '',
      sensitive: true,
      env: 'REDIS_PASSWORD'
    },
    keyPrefix: {
      doc: 'Redis cache key prefix name used to isolate the cached results across multiple clients',
      format: String,
      default: 'aqie-front-end:',
      env: 'REDIS_KEY_PREFIX'
    }
  },
  tracing: {
    header: {
      doc: 'Which header to track',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  }
}

export { EXTRA_CONFIG_SCHEMA }
