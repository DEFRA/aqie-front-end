import { createLogger } from './logging/logger.js'
import { catchFetchError } from './catch-fetch-error.js'
import { config } from '../../../config/index.js'

const logger = createLogger()

const tokenUrl = config.get('oauthTokenUrlNIreland')
const oauthTokenNorthernIrelandTenantId = config.get(
  'oauthTokenNorthernIrelandTenantId'
)
const clientId = config.get('clientIdNIreland')
const clientSecret = config.get('clientSecretNIreland')
const redirectUri = config.get('redirectUriNIreland')
const scope = config.get('scopeNIreland')

export async function fetchOAuthToken(options = {}) {
  const fetchLogger = options.logger || logger

  fetchLogger.info('OAuth token requested:')

  const url = `${tokenUrl}/${oauthTokenNorthernIrelandTenantId}/oauth2/v2.0/token`
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      scope,
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
    fetchLogger.error('Error OAuth statusCodeToken fetched:', statusCodeToken)
  } else {
    fetchLogger.info('OAuth token fetched:::')
  }

  return dataToken.access_token
}
