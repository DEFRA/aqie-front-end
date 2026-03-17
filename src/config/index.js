import 'dotenv/config'
import convict from 'convict'
import path, { dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import convictFormatWithValidator from 'convict-format-with-validator'

const fileName = fileURLToPath(import.meta.url)
const dirName = dirname(fileName)

const fourHoursMs = 14400000

// Define constants for configuration values
const DEFAULT_PORT = 3000

// Define a constant for one week in milliseconds
const DAYS_IN_A_WEEK = 7
const ONE_WEEK_IN_MILLISECONDS = DAYS_IN_A_WEEK * 24 * 60 * 60 * 1000

export const ONE_HOUR_MS =
  Number(process.env.ONE_HOUR_MS) > 0
    ? Number(process.env.ONE_HOUR_MS)
    : 60 * 60 * 1000
export const FIFTEEN_MINUTES_MS =
  Number(process.env.FIFTEEN_MINUTES_MS) > 0
    ? Number(process.env.FIFTEEN_MINUTES_MS)
    : 15 * 60 * 1000
export const REDIS_SHARED_CACHE_TTL_MS =
  Number(process.env.REDIS_SHARED_CACHE_TTL_MS) > 0
    ? Number(process.env.REDIS_SHARED_CACHE_TTL_MS)
    : 20 * 60 * 1000
export const REFRESH_INTERVAL_MS =
  Number(process.env.REFRESH_INTERVAL_MS) > 0
    ? Number(process.env.REFRESH_INTERVAL_MS)
    : 30 * 60 * 1000
export const REDIS_PRESSURE_CHECK_INTERVAL_MS =
  Number(process.env.REDIS_PRESSURE_CHECK_INTERVAL_MS) > 0
    ? Number(process.env.REDIS_PRESSURE_CHECK_INTERVAL_MS)
    : 10000
export const REDIS_PRESSURE_WINDOW_MS =
  Number(process.env.REDIS_PRESSURE_WINDOW_MS) > 0
    ? Number(process.env.REDIS_PRESSURE_WINDOW_MS)
    : 30000
export const REDIS_PRESSURE_COOLDOWN_MS =
  Number(process.env.REDIS_PRESSURE_COOLDOWN_MS) > 0
    ? Number(process.env.REDIS_PRESSURE_COOLDOWN_MS)
    : 300000
export const REDIS_PRESSURE_MIN_GROWTH_MEBIBYTES =
  Number(process.env.REDIS_PRESSURE_MIN_GROWTH_MEBIBYTES) > 0
    ? Number(process.env.REDIS_PRESSURE_MIN_GROWTH_MEBIBYTES)
    : 20
export const BYTES_PER_MEBIBYTE =
  Number(process.env.BYTES_PER_MEBIBYTE) > 0
    ? Number(process.env.BYTES_PER_MEBIBYTE)
    : 1024 * 1024

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'
const isPerfTest = process.env.NODE_ENV === 'perf-test'

convict.addFormats(convictFormatWithValidator)

export const config = convict({
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test', 'perf-test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  host: {
    doc: 'The IP address to bind',
    format: String,
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: DEFAULT_PORT,
    env: 'PORT'
  },
  staticCacheTimeout: {
    doc: 'Static cache timeout in milliseconds',
    format: Number,
    default: ONE_WEEK_IN_MILLISECONDS,
    env: 'STATIC_CACHE_TIMEOUT'
  },
  cacheDurations: {
    refreshIntervalMs: {
      doc: 'Refresh interval in milliseconds for periodic cache refresh behaviour.',
      format: Number,
      default: REFRESH_INTERVAL_MS,
      env: 'REFRESH_INTERVAL_MS'
    },
    serverSharedCacheTtlMs: {
      doc: 'TTL in milliseconds for the server shared cache policy.',
      format: Number,
      default: ONE_HOUR_MS,
      env: 'SERVER_SHARED_CACHE_TTL_MS'
    },
    userDataCacheTtlMs: {
      doc: 'TTL in milliseconds for user metadata cache entries.',
      format: Number,
      default: FIFTEEN_MINUTES_MS,
      env: 'USER_DATA_CACHE_TTL_MS'
    },
    sharedLocationCacheTtlMs: {
      doc: 'TTL cap in milliseconds for shared location payload cache entries.',
      format: Number,
      default: REDIS_SHARED_CACHE_TTL_MS,
      env: 'SHARED_LOCATION_CACHE_TTL_MS'
    }
  },
  serviceName: {
    doc: 'Applications Service Name',
    format: String,
    default: 'Check air quality'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.resolve(dirName, '../..')
  },
  assetPath: {
    doc: 'Asset path',
    format: String,
    default: '/public',
    env: 'ASSET_PATH'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: isProduction
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: isDevelopment
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: isTest
  },
  isPerfTest: {
    doc: 'If this application running in the perf-test environment',
    format: Boolean,
    default: isPerfTest
  },
  enabledMock: {
    doc: 'Enabled Mock Data for Northern Ireland Names API',
    format: Boolean,
    default: false,
    env: 'ENABLED_MOCK'
  },
  useNewRicardoMeasurementsEnabled: {
    doc: 'Falg To Use New Ricardo Measurements API',
    format: Boolean,
    default: true,
    env: 'USE_NEW_RICARDO_MEASUREMENTS_ENABLED'
  },
  log: {
    enabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: process.env.NODE_ENV !== 'test',
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in.',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : []
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  httpsProxy: {
    doc: 'HTTPS Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTPS_PROXY'
  },
  isSecureContextEnabled: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  isMetricsEnabled: {
    doc: 'Enable metrics reporting',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_METRICS'
  },
  disableTestMocks: {
    doc: 'Disable test mock parameters (mockLevel, mockDay, mockPollutantBand, testMode). Enabled (false) in local/dev/test environments, disabled (true) in production and perf-test environments. Can be overridden with DISABLE_TEST_MOCKS environment variable.',
    format: Boolean,
    default: isProduction || isPerfTest,
    env: 'DISABLE_TEST_MOCKS'
  },
  airQualityDomainUrl: {
    doc: 'Air Quality Domain Url',
    format: '*',
    default: 'https://check-air-quality.service.gov.uk'
  },
  userResearchPanelUrl: {
    doc: 'User research panel URL displayed on notify success pages',
    format: String,
    default: 'https://defragroup.eu.qualtrics.com/jfe/form/SV_1Yf4v6n0W2uS2LQ',
    env: 'USER_RESEARCH_PANEL_URL'
  },
  osNamesApiKey: {
    doc: 'OS Name Places key',
    format: '*',
    sensitive: true,
    default: '',
    env: 'OS_NAMES_API_KEY'
  },
  osNamesApiUrl: {
    doc: 'OS Name Places url',
    format: String,
    default: 'https://api.os.uk/search/names/v1/find?query=',
    env: 'OS_NAMES_API_URL'
  },
  daqiePassword: {
    doc: 'password for daqie',
    format: '*',
    default: 'air',
    sensitive: true,
    env: 'DAQIE_PASSWORD'
  },
  session: {
    cache: {
      engine: {
        doc: 'backend cache is written to',
        format: ['redis', 'memory'],
        default: isProduction ? 'redis' : 'memory',
        env: 'SESSION_CACHE_ENGINE'
      },
      memory: {
        maxByteSize: {
          doc: 'Maximum in-memory cache size in bytes when SESSION_CACHE_ENGINE=memory',
          format: Number,
          default: 536870912, // 512MB
          env: 'SESSION_CACHE_MEMORY_MAX_BYTE_SIZE'
        }
      },
      name: {
        doc: 'server side session cache name',
        format: String,
        default: 'session',
        env: 'SESSION_CACHE_NAME'
      },
      ttl: {
        doc: 'server side session cache ttl',
        format: Number,
        default: fourHoursMs,
        env: 'SESSION_CACHE_TTL'
      },
      globalGuardEnabled: {
        doc: 'Master switch for session mutation guards. When false in non-production, both pressure and no-cookie guards are disabled for local simulation.',
        format: Boolean,
        default: true,
        env: 'SESSION_GLOBAL_GUARD_ENABLED'
      },
      redisPressure: {
        checkIntervalMs: {
          doc: 'Interval between Redis memory samples for pressure guard.',
          format: Number,
          default: REDIS_PRESSURE_CHECK_INTERVAL_MS,
          env: 'REDIS_PRESSURE_CHECK_INTERVAL_MS'
        },
        windowMs: {
          doc: 'Maximum elapsed time window for pressure growth calculation.',
          format: Number,
          default: REDIS_PRESSURE_WINDOW_MS,
          env: 'REDIS_PRESSURE_WINDOW_MS'
        },
        cooldownMs: {
          doc: 'Cooldown period while Redis pressure guard remains active.',
          format: Number,
          default: REDIS_PRESSURE_COOLDOWN_MS,
          env: 'REDIS_PRESSURE_COOLDOWN_MS'
        },
        minGrowthMebibytes: {
          doc: 'Minimum Redis memory growth in MiB to activate pressure guard.',
          format: Number,
          default: REDIS_PRESSURE_MIN_GROWTH_MEBIBYTES,
          env: 'REDIS_PRESSURE_MIN_GROWTH_MEBIBYTES'
        },
        bytesPerMebibyte: {
          doc: 'Byte size used for one MiB in Redis pressure calculations.',
          format: Number,
          default: BYTES_PER_MEBIBYTE,
          env: 'BYTES_PER_MEBIBYTE'
        }
      }
    },
    cookie: {
      ttl: {
        doc: 'Session cookie ttl',
        format: Number,
        default: fourHoursMs,
        env: 'SESSION_COOKIE_TTL'
      },
      password: {
        doc: 'session cookie password',
        format: String,
        default: 'the-password-must-be-at-least-32-characters-long',
        env: 'SESSION_COOKIE_PASSWORD',
        sensitive: true
      },
      secure: {
        doc: 'set secure flag on cookie',
        format: Boolean,
        default: isProduction,
        env: 'SESSION_COOKIE_SECURE'
      }
    }
  },
  cookiePassword: {
    doc: 'password for  cookie',
    format: '*',
    default: 'the-password-must-be-at-least-32-characters-long',
    sensitive: true,
    env: 'COOKIE_PASSWORD'
  },
  forecastsApiUrl: {
    doc: 'API forecast rss feed',
    format: String,
    default: `https://aqie-forecast-api.dev.cdp-int.defra.cloud/forecast`,
    env: 'FORECAST_API_URL'
  },
  cdpXApiKey: {
    doc: 'CDP X API Key',
    format: '*',
    default: '',
    sensitive: true,
    env: 'CDP_X_API_KEY'
  },
  cdpXApiKeyDev: {
    doc: 'CDP X API Key for development ephemeral gateway',
    format: '*',
    default: '',
    sensitive: true,
    env: 'CDP_X_API_KEY_DEV'
  },
  cdpXApiKeyTest: {
    doc: 'CDP X API Key for test ephemeral gateway',
    format: '*',
    default: '',
    sensitive: true,
    env: 'CDP_X_API_KEY_TEST'
  },
  cdpXApiKeyPerfTest: {
    doc: 'CDP X API Key for perf-test ephemeral gateway',
    format: '*',
    default: '',
    sensitive: true,
    env: 'CDP_X_API_KEY_PERF_TEST'
  },
  ephemeralProtectedTestApiUrl: {
    doc: 'Ephemeral Protected Test API url',
    format: String,
    default: `https://ephemeral-protected.api.test.cdp-int.defra.cloud`,
    env: 'EPHEMERAL_PROTECTED_TEST_API_URL'
  },
  ephemeralProtectedDevApiUrl: {
    doc: 'Ephemeral Protected Dev API url',
    format: String,
    default: `https://ephemeral-protected.api.test.cdp-int.defra.cloud`,
    env: 'EPHEMERAL_PROTECTED_DEV_API_URL'
  },
  ephemeralProtectedPerfTestApiUrl: {
    doc: 'Ephemeral Protected Perf-Test API url',
    format: String,
    default: '',
    env: 'EPHEMERAL_PROTECTED_PERF_TEST_API_URL'
  },
  measurementsApiUrl: {
    doc: 'Ricardo API url',
    format: String,
    default: `https://aqie-back-end.dev.cdp-int.defra.cloud/measurements`,
    env: 'MEASUREMENTS_API_URL'
  },
  ricardoMeasurementsApiUrl: {
    doc: 'New Ricardo API url',
    format: String,
    default: `https://aqie-back-end.dev.cdp-int.defra.cloud/monitoringStationInfo?`,
    env: 'NEW_RICARDO_MEASUREMENTS_API_URL'
  },
  forecastSummaryUrl: {
    doc: 'Summary forecast url',
    format: String,
    default: 'https://uk-air.defra.gov.uk/ajax/forecast_text_summary.php',
    env: 'FORECAST_SUMMARY_URL'
  },
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
      default: '/subscribe/email',
      env: 'NOTIFY_EMAIL_PATH'
    },
    emailGenerateLinkPath: {
      doc: 'Notify API path for generating email confirmation links',
      format: String,
      default: '/subscribe/email/generate-link',
      env: 'NOTIFY_EMAIL_GENERATE_LINK_PATH'
    },
    emailValidateLinkPath: {
      doc: 'Notify API path for validating email confirmation links',
      format: String,
      default: '/subscribe/email/validate-link',
      env: 'NOTIFY_EMAIL_VALIDATE_LINK_PATH'
    },
    setupAlertPath: {
      doc: 'Alert backend path to create subscriptions',
      format: String,
      default: '/api/subscriptions',
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
    },
    useSingleInstanceCache: {
      doc: 'Connect to a single instance of redis instead of a cluster.',
      format: Boolean,
      default: !isProduction,
      env: 'USE_SINGLE_INSTANCE_CACHE'
    },
    useTLS: {
      doc: 'Connect to redis using TLS',
      format: Boolean,
      default: isProduction,
      env: 'REDIS_TLS'
    }
  },
  nunjucks: {
    watch: {
      doc: 'Reload templates when they are changed.',
      format: Boolean,
      default: isDevelopment
    },
    noCache: {
      doc: 'Use a cache and recompile templates each time',
      format: Boolean,
      default: isDevelopment
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
})

// '' Load local overrides from src/config/local.json when in development
if (isDevelopment) {
  const localConfigPath = path.resolve(dirName, './local.json')
  if (existsSync(localConfigPath)) {
    try {
      config.loadFile(localConfigPath)
    } catch (err) {
      // Ignore malformed local configs but log for awareness
      console.warn(`Failed to load local config: ${localConfigPath}`, err)
    }
  }
}

config.validate({ allowed: 'strict' })
