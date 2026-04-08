// ''
import { createLogger } from './logging/logger.js'
import { catchFetchError } from './catch-fetch-error.js'
import { config } from '../../../config/index.js'

const logger = createLogger()

function validateNIConfig(fetchLogger) {
  const vars = {
    OAUTH_TOKEN_NORTHERN_IRELAND_API_TENANT_ID: config.get(
      'oauthTokenNorthernIrelandTenantId'
    ),
    OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_ID:
      config.get('clientIdNIreland'),
    OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SECRET: config.get(
      'clientSecretNIreland'
    ),
    OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE:
      config.get('scopeNIreland'),
    OS_PLACES_POSTCODE_NORTHERN_IRELAND_URL: config.get(
      'osPlacesApiPostcodeNorthernIrelandUrl'
    )
  }

  const missing = Object.entries(vars)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length > 0) {
    fetchLogger.error(
      `[fetchOAuthToken] Missing NI config — the following env vars are not set: ${missing.join(', ')}`
    )
  }

  return vars
}

export async function fetchOAuthToken(options = {}) {
  const fetchLogger = options.logger || logger

  const vars = validateNIConfig(fetchLogger)

  const tokenUrl = config.get('oauthTokenUrlNIreland')
  const url = `${tokenUrl}/${vars.OAUTH_TOKEN_NORTHERN_IRELAND_API_TENANT_ID}/oauth2/v2.0/token`
  const redirectUri = config.get('redirectUriNIreland')

  fetchLogger.info(
    `[fetchOAuthToken] Requesting token from: ${tokenUrl}/<tenantId>/oauth2/v2.0/token`
  )
  fetchLogger.info(
    `[fetchOAuthToken] client_id set: ${!!vars.OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_ID}, scope set: ${!!vars.OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE}`
  )

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: vars.OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_ID,
      client_secret: vars.OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SECRET,
      redirect_uri: redirectUri,
      scope: vars.OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE,
      grant_type: 'client_credentials',
      state: '1245'
    })
  }

  // Invoking token API
  const [statusCodeToken, dataToken] = await catchFetchError(
    url,
    requestOptions,
    true
  )

  if (statusCodeToken !== 200) {
    fetchLogger.error(
      `[fetchOAuthToken] OAuth token request failed — statusCode: ${statusCodeToken}, error: ${dataToken?.error ?? 'unknown'}, description: ${dataToken?.error_description ?? 'none'}`
    )
    return {
      error: dataToken?.error ?? 'token_request_failed',
      statusCode: statusCodeToken
    }
  }

  if (!dataToken?.access_token) {
    fetchLogger.error(
      '[fetchOAuthToken] OAuth token response did not contain access_token'
    )
    return { error: 'missing_access_token' }
  }

  fetchLogger.info('[fetchOAuthToken] OAuth token obtained successfully')
  return dataToken.access_token
}
