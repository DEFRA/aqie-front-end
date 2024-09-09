import convict from 'convict'
import path from 'path'

const oneWeek = 7 * 24 * 60 * 60 * 1000

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  staticCacheTimeout: {
    doc: 'Static cache timeout in milliseconds',
    format: Number,
    default: oneWeek,
    env: 'STATIC_CACHE_TIMEOUT'
  },
  serviceName: {
    doc: 'Applications Service Name',
    format: String,
    default: 'Check local air quality'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.normalize(path.join(__dirname, '..', '..'))
  },
  assetPath: {
    doc: 'Asset path',
    format: String,
    default: 'public',
    env: 'ASSET_PATH'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'test'
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTP_PROXY'
  },
  httpsProxy: {
    doc: 'HTTPS Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTPS_PROXY'
  },
  osPlacesApiKey: {
    doc: 'OS Name Places key',
    format: '*',
    sensitive: true,
    default: 'vvR3FiaNjSWCnFzSKBst23TX6efl0oL9',
    env: 'OS_PLACES_API_KEY'
  },
  newApiKey: {
    doc: 'New Northern Ireland key',
    format: '*',
    sensitive: true,
    default: '',
    env: 'NEW_NORTHERN_IRELAND_API_KEY'
  },
  osPlacesApiUrl: {
    doc: 'OS Name Places url',
    format: String,
    default: 'https://api.os.uk/search/names/v1/find?query=',
    env: 'OS_PLACES_API_URL'
  },
  daqiePassword: {
    doc: 'password for daqie',
    format: '*',
    default: 'air',
    sensitive: true,
    env: 'DAQIE_PASSWORD'
  },
  cookiePassword: {
    doc: 'password for  cookie',
    format: '*',
    default: 'the-password-must-be-at-least-32-characters-long',
    sensitive: true,
    env: 'COOKIE_PASSWORD'
  },
  sessionCookiePassword: {
    doc: 'session password for  cookie',
    format: '*',
    default: 'the-password-must-be-at-least-32-characters-long',
    sensitive: true,
    env: 'SESSION_COOKIE_PASSWORD'
  },
  forecastsApiUrl: {
    doc: 'API forecast rss feed',
    format: String,
    default: `https://aqie-back-end.dev.cdp-int.defra.cloud/forecasts`,
    env: 'FORECAST_API_URL'
  },
  measurementsApiUrl: {
    doc: 'Ricardo API url',
    format: String,
    default: `https://aqie-back-end.dev.cdp-int.defra.cloud/measurements`,
    env: 'MEASUREMENTS_API_URL'
  },
  forecastSummaryUrl: {
    doc: 'Summary forecast url',
    format: String,
    default: 'https://uk-air.defra.gov.uk/ajax/forecast_text_summary.php',
    env: 'FORECAST_SUMMARY_URL'
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
    default: 'https://login.microsoftonline.com/6f504113-6b64-43f2-ade9-242e05780007/oauth2/v2.0/token',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_OAUTH_TOKEN_URL'
  },
  osPlacesApiPostcodeNorthernIrelandUrl: {
    doc: 'Search postcode Northern Ireland with osPlaces url',
    format: String,
    default: 'https://dev-api-gateway.azure.defra.cloud/api/address-lookup/v2.0/addresses?postcode=',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL'
  },
  osPlacesApiPostcodeNorthernIrelandKey: {
    doc: 'OS Name Places Postcode Northern Ireland key',
    format: '*',
    sensitive: true,
    default: '',
    env: 'OS_PLACES_POSTCODE_NORTHERN_IRELAND_API_KEY'
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
  redis: {
    enabled: {
      doc: 'Enable Redis on your Frontend. Before you enable Redis, contact the CDP platform team as we need to set up config so you can run Redis in CDP environments',
      format: Boolean,
      default: false,
      env: 'REDIS_ENABLED'
    },
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
      default: 'aqie-front-end',
      env: 'REDIS_KEY_PREFIX'
    },
    useSingleInstanceCache: {
      doc: 'Enable the use of a single instance Redis Cache',
      format: Boolean,
      default: process.env.NODE_ENV !== 'production',
      env: 'USE_SINGLE_INSTANCE_CACHE'
    }
  }
})

config.validate({ allowed: 'strict' })

export { config }
