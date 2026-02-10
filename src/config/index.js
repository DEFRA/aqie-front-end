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
  notify: {
    enabled: {
      doc: 'Enable notify service (sends via backend wrapper API)',
      format: Boolean,
      default: false,
      env: 'NOTIFY_ENABLED'
    },
    mockOtpEnabled: {
      doc: 'Enable mock OTP mode (bypasses backend service entirely for local and test environments)',
      format: Boolean,
      default: false,
      env: 'NOTIFY_MOCK_OTP_ENABLED'
    },
    mockOtpCode: {
      doc: 'Mock OTP code to use when mock mode is active',
      format: String,
      default: '12345',
      env: 'NOTIFY_MOCK_OTP_CODE'
    },
    mockSetupAlertEnabled: {
      doc: 'Enable mock setup alert fallback when backend service fails (for local and test environments ONLY - never use in production)',
      format: Boolean,
      default: false,
      env: 'NOTIFY_MOCK_SETUP_ALERT_ENABLED'
    },
    baseUrl: {
      doc: 'Backend notify wrapper API base URL',
      format: String,
      default: 'https://aqie-notify-service.test.cdp-int.defra.cloud',
      env: 'NOTIFY_BASE_URL'
    },
    alertBackendBaseUrl: {
      doc: 'Alert backend service base URL for setup-alert endpoint',
      format: String,
      default: 'https://aqie-alert-back-end-service.test.cdp-int.defra.cloud',
      env: 'ALERT_BACKEND_BASE_URL'
    },
    emailPath: {
      doc: 'Backend API path for sending email codes',
      format: String,
      default: '/send-email-code',
      env: 'NOTIFY_EMAIL_PATH'
    },
    smsPath: {
      doc: 'Backend API path for generating OTP (SMS)',
      format: String,
      default: '/subscribe/generate-otp',
      env: 'NOTIFY_SMS_PATH'
    },
    verifyOtpPath: {
      doc: 'Backend API path for verifying OTP',
      format: String,
      default: '/subscribe/validate-otp',
      env: 'NOTIFY_VERIFY_OTP_PATH'
    },
    setupAlertPath: {
      doc: 'Backend API path for setting up alert subscription',
      format: String,
      default: '/setup-alert',
      env: 'NOTIFY_SETUP_ALERT_PATH'
    },
    getSubscriptionsPath: {
      doc: 'Backend API path for getting user subscriptions',
      format: String,
      default: '/api/subscriptions',
      env: 'NOTIFY_GET_SUBSCRIPTIONS_PATH'
    },
    timeoutMs: {
      doc: 'Request timeout in milliseconds',
      format: 'int',
      default: 5000,
      env: 'NOTIFY_TIMEOUT_MS'
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
  ephemeralProtectedDevApiUrl: {
    doc: 'Ephemeral Protected Dev API url',
    format: String,
    default: `https://ephemeral-protected.api.test.cdp-int.defra.cloud`,
    env: 'EPHEMERAL_PROTECTED_DEV_API_URL'
  },
  ricardoMeasurementsApiUrl: {
    doc: 'Ricardo Measurements API url',
    format: String,
    default: `https://aqie-back-end.test.cdp-int.defra.cloud/monitoringStationInfo?`,
    env: 'RICARDO_MEASUREMENTS_API_URL'
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
  scopeNIreland: {
    doc: 'OS Name Places Postcode Northern Ireland client scope',
    format: '*',
    sensitive: true,
    default: '',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE'
  },
  niApiTimeoutMs: {
    doc: 'Northern Ireland API request timeout in milliseconds',
    format: Number,
    default: 8000,
    env: 'NI_API_TIMEOUT_MS'
  },
  niApiMaxRetries: {
    doc: 'Maximum number of retry attempts for Northern Ireland API calls',
    format: Number,
    default: 2,
    env: 'NI_API_MAX_RETRIES'
  },
  niApiRetryDelayMs: {
    doc: 'Delay in milliseconds between retry attempts for Northern Ireland API',
    format: Number,
    default: 1000,
    env: 'NI_API_RETRY_DELAY_MS'
  },
  niApiCircuitBreakerEnabled: {
    doc: 'Enable NI API circuit breaker to prevent repeated failures',
    format: Boolean,
    default: true,
    env: 'NI_API_CIRCUIT_BREAKER_ENABLED'
  },
  niApiCircuitBreakerFailureThreshold: {
    doc: 'Failures required to open NI API circuit breaker',
    format: Number,
    default: 3,
    env: 'NI_API_CIRCUIT_BREAKER_FAILURE_THRESHOLD'
  },
  niApiCircuitBreakerOpenMs: {
    doc: 'Time in milliseconds the NI API circuit breaker remains open',
    format: Number,
    default: 60000,
    env: 'NI_API_CIRCUIT_BREAKER_OPEN_MS'
  },
  niApiCacheEnabled: {
    doc: 'Enable NI API response cache fallback',
    format: Boolean,
    default: true,
    env: 'NI_API_CACHE_ENABLED'
  },
  niApiCacheTtlMs: {
    doc: 'NI API response cache TTL in milliseconds',
    format: Number,
    default: 600000,
    env: 'NI_API_CACHE_TTL_MS'
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
  },
  userResearchPanelUrl: {
    doc: 'URL for user research panel sign up',
    format: String,
    default: 'https://defragroup.eu.qualtrics.com/jfe/form/SV_3JEDGo4ZaGtBpHw',
    env: 'USER_RESEARCH_PANEL_URL'
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
