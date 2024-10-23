/* eslint-disable prettier/prettier */
import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { catchFetchError } from '~/src/server/common/helpers/catch-fetch-error'
import { catchProxyFetchError } from '~/src/server/common/helpers/catch-proxy-fetch-error'

const options = {
  method: 'get',
  headers: { 'Content-Type': 'text/json', preserveWhitespace: true }
}
const logger = createLogger()
const clientId = config.get('clientIdNIreland')
const clientSecret = config.get('clientSecretNIreland')
const redirectUri = config.get('redirectUriNIreland')
const scope = config.get('scopeNIreland')
const tokenUrl = config.get('oauthTokenUrlNIreland')
const oauthTokenNorthernIrelandTenantId = config.get(
  'oauthTokenNorthernIrelandTenantId'
)

const fetchOAuthToken = async () => {
  logger.info(`OAuth token requested:`)
  const url = `${tokenUrl}/${oauthTokenNorthernIrelandTenantId}/oauth2/v2.0/token`
  const options = {
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
  const [errorToken, dataToken] = await catchProxyFetchError(url, options, true)
  if (errorToken) {
    logger.error('Error OAuth token fetched:', errorToken)
  } else {
    logger.info(`OAuth token fetched:::`)
  }

  return dataToken.access_token
}

async function fetchData(locationType, userLocation, request, h) {
  let optionsOAuth
  let savedAccessToken
  let accessToken
  if (locationType === 'ni-location') {
    savedAccessToken = request.yar.get('savedAccessToken')
    logger.info(`::::::::: OAuth token in session 1 ::::::::::`)
    if (savedAccessToken) {
      accessToken = savedAccessToken
    } else {
      accessToken = await fetchOAuthToken()
    }
    logger.info(`::::::::: accessTokennnn ::::::::::`)
    optionsOAuth = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }
  // Function to refresh the OAuth token and update the session
  const refreshOAuthToken = async (request) => {
    accessToken = await fetchOAuthToken()
    request.yar.clear('savedAccessToken')
    request.yar.set('savedAccessToken', accessToken)
    logger.info(`::::::::: OAuth token in session 2 ::::::::::`)
  }
  // Set an interval to refresh the OAuth token every 19 minutes (1140 seconds)
  const refreshIntervalId = setInterval(
    () => {
      // Assuming you have access to the request object here
      if (locationType === 'ni-location') {
        refreshOAuthToken(request)
      } else {
        clearRefreshInterval()
      }
    },
    30 * 60 * 1000
  ) // 1 minute in milliseconds

  // Function to clear the interval
  const clearRefreshInterval = () => {
    clearInterval(refreshIntervalId)
    logger.info('::::::::: OAuth token refresh interval cleared ::::::::::')
  }

  const symbolsArr = ['%', '$', '&', '#', '!', '¬', '`']
  const forecastSummaryURL = config.get('forecastSummaryUrl')
  const forecastsAPIurl = config.get('forecastsApiUrl')
  const measurementsAPIurl = config.get('measurementsApiUrl')
  const [forecastError, getForecasts] = await catchFetchError(
    forecastsAPIurl,
    options
  )
  if (forecastError) {
    logger.error(`Error fetching forecasts data: ${forecastError.message}`)
  } else {
    logger.info(`forecasts data fetched:`)
  }
  const [errorMeasurements, getMeasurements] = await catchFetchError(
    measurementsAPIurl,
    options
  )
  if (errorMeasurements) {
    logger.error(
      `Error fetching Measurements data: ${errorMeasurements.message}`
    )
  } else {
    logger.info(`getMeasurements data fetched:`)
  }
  const [errorSummary, getDailySummary] = await catchProxyFetchError(
    forecastSummaryURL,
    options,
    true
  )
  if (errorSummary) {
    logger.error(`Error fetching getDailySummary data: ${errorSummary.message}`)
  } else {
    logger.info(`getDailySummary data fetched:`)
  }

  if (locationType === 'uk-location') {
    const filters = [
      'LOCAL_TYPE:City',
      'LOCAL_TYPE:Town',
      'LOCAL_TYPE:Village',
      'LOCAL_TYPE:Suburban_Area',
      'LOCAL_TYPE:Postcode',
      'LOCAL_TYPE:Airport'
    ].join('+')
    const osPlacesApiUrl = config.get('osPlacesApiUrl')
    const osPlacesApiKey = config.get('osPlacesApiKey')
    const osPlacesApiUrlFull = `${osPlacesApiUrl}${encodeURIComponent(
      userLocation
    )}&fq=${encodeURIComponent(filters)}&key=${osPlacesApiKey}`

    const shouldCallApi = symbolsArr.some((symbol) =>
      userLocation.includes(symbol)
    )
    logger.info(
      `osPlace data requested osPlacesApiUrlFull: ${osPlacesApiUrlFull}`
    )
    const [osPlacesError, getOSPlaces] = await catchProxyFetchError(
      osPlacesApiUrlFull,
      options,
      !shouldCallApi
    )
    if (errorSummary) {
      logger.error(
        `Error fetching osPlacesError data: ${osPlacesError.message}`
      )
    } else {
      logger.info(`getOSPlaces data fetched:`)
    }
    return { getDailySummary, getForecasts, getMeasurements, getOSPlaces }
  } else if (locationType === 'ni-location') {
    const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
      'osPlacesApiPostcodeNorthernIrelandUrl'
    )
    const postcodeNortherIrelandURL = `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocation)}&maxresults=1`
    const [errorNortherIreland, getNIPlaces] = await catchProxyFetchError(
      postcodeNortherIrelandURL,
      optionsOAuth,
      true
    )
    if (errorNortherIreland) {
      logger.error(
        `Error fetching errorNortherIreland data: ${errorNortherIreland.message}`
      )
    } else {
      logger.info(`getNIPlaces data fetched:`)
    }
    return { getDailySummary, getForecasts, getMeasurements, getNIPlaces }
  }
}

export { fetchData }
