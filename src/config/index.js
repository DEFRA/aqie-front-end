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
  osPlacesApiKey: {
    doc: 'OS Name Places key',
    format: '*',
    sensitive: true,
    env: 'OS_PLACES_API_KEY'
  },
  osPlacesApiUrl: {
    doc: 'OS Name Places url',
    format: String,
    env: 'OS_PLACES_API_URL'
  },
  daqiePassword: {
    doc: 'password for daqie',
    format: '*',
    default: '',
    sensitive: true,
    env: 'DAQIE_PASSWORD'
  },
  forecastsApiUrl: {
    doc: 'API forecast rss feed',
    format: String,
    env: 'FORECAST_API_URL'
  },
  measurementsApiUrl: {
    doc: 'Ricardo API url',
    format: String,
    env: 'MEASUREMENTS_API_URL'
  },
  forecastSummaryUrl: {
    doc: 'Summary forecast url',
    format: String,
    env: 'FORECAST_SUMMARY_URL'
  },
  postcodeNortherIrelandUrl: {
    doc: 'Search postcode Northern Ireland url',
    format: String,
    env: 'POSTCODE_NORTHERN_IRELAND_URL'
  }
})

config.validate({ allowed: 'strict' })

export { config }
