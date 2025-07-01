import { config } from '../../../config/index.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { catchFetchError } from '../../common/helpers/catch-fetch-error.js'
import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import {
  LOCATION_TYPE_NI,
  SYMBOLS_ARRAY,
  HTTP_STATUS_OK,
  REFRESH_INTERVAL_MS
} from '../../data/constants.js'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  formatNorthernIrelandPostcode
} from './convert-string.js'

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
const isMockEnabled = config.get('enabledMock')
const oauthTokenNorthernIrelandTenantId = config.get(
  'oauthTokenNorthernIrelandTenantId'
)

const fetchOAuthToken = async () => {
  logger.info(`OAuth token requested:`)
  const url = `${tokenUrl}/${oauthTokenNorthernIrelandTenantId}/oauth2/v2.0/token`
  const tokenOptions = {
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
  const [statusCodeToken, dataToken] = await catchProxyFetchError(
    url,
    tokenOptions,
    true
  )
  if (statusCodeToken !== HTTP_STATUS_OK) {
    logger.error('Error OAuth statusCodeToken fetched:', statusCodeToken)
  } else {
    logger.info(`OAuth token fetched:::`)
  }

  return dataToken.access_token
}

async function fetchData(
  request,
  { locationType, userLocation, searchTerms, secondSearchTerm }
) {
  let optionsOAuth
  let savedAccessToken
  let accessToken
  if (locationType === LOCATION_TYPE_NI && !isMockEnabled) {
    savedAccessToken = request.yar.get('savedAccessToken')
    if (savedAccessToken) {
      accessToken = savedAccessToken
    } else {
      accessToken = await fetchOAuthToken()
    }
    optionsOAuth = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }
  // Function to refresh the OAuth token and update the session
  const refreshOAuthToken = async () => {
    accessToken = await fetchOAuthToken()
    request.yar.clear('savedAccessToken')
    request.yar.set('savedAccessToken', accessToken)
  }
  // Set an interval to refresh the OAuth token every 19 minutes (1140 seconds)
  const refreshIntervalId = setInterval(() => {
    // Assuming you have access to the request object here
    if (locationType === LOCATION_TYPE_NI && !isMockEnabled) {
      refreshOAuthToken()
    } else {
      clearRefreshInterval()
    }
  }, REFRESH_INTERVAL_MS) // 1 minute in milliseconds

  // Function to clear the interval
  const clearRefreshInterval = () => {
    clearInterval(refreshIntervalId)
  }
  const northernIrelandPostcodeRegex = /^BT\d{1,2}\s?\d?[A-Z]{0,2}$/
  const niPoscode = northernIrelandPostcodeRegex.test(userLocation)
  const forecastSummaryURL = config.get('forecastSummaryUrl')
  const forecastsAPIurl = config.get('forecastsApiUrl')
  const measurementsAPIurl = config.get('measurementsApiUrl')
  // Invoking Forecast API
  const [forecastError, getForecasts] = await catchFetchError(
    forecastsAPIurl,
    options
  )
  if (forecastError) {
    logger.error(`Error fetching forecasts data: ${forecastError.message}`)
  } else {
    logger.info(`forecasts data fetched:`)
  }
  // Invoking MeasureMent API
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
  // Invoking Forecast Summary API
  const [statusCodeSummary, getDailySummary] = await catchProxyFetchError(
    forecastSummaryURL,
    options,
    true
  )
  if (statusCodeSummary !== HTTP_STATUS_OK) {
    logger.error(`Error fetching statusCodeSummary data: ${statusCodeSummary}`)
  } else {
    logger.info(`getDailySummary data fetched:`)
  }

  // Refactored to use 'return' consistently
  if (locationType === 'uk-location') {
    const filters = [
      'LOCAL_TYPE:City',
      'LOCAL_TYPE:Town',
      'LOCAL_TYPE:Village',
      'LOCAL_TYPE:Suburban_Area',
      'LOCAL_TYPE:Postcode',
      'LOCAL_TYPE:Airport'
    ].join('+')
    const osNamesApiUrl = config.get('osNamesApiUrl')
    const osNamesApiKey = config.get('osNamesApiKey')

    if (
      !isValidFullPostcodeUK(userLocation.toUpperCase()) &&
      !isValidPartialPostcodeUK(userLocation.toUpperCase()) &&
      searchTerms &&
      secondSearchTerm !== 'UNDEFINED'
    ) {
      userLocation = `${searchTerms} ${secondSearchTerm}`
    }
    const osNamesApiUrlFull = `${osNamesApiUrl}${encodeURIComponent(
      userLocation
    )}&fq=${encodeURIComponent(filters)}&key=${osNamesApiKey}`

    let shouldCallApi = !SYMBOLS_ARRAY.some((symbol) =>
      userLocation.includes(symbol)
    )
    if (niPoscode) {
      shouldCallApi = false
    }
    logger.info(
      `osPlace data requested osNamesApiUrlFull: ${osNamesApiUrlFull}`
    )
    // Invoking OS Names API
    const [statusCodeOSPlace, getOSPlaces] = await catchProxyFetchError(
      osNamesApiUrlFull,
      options,
      shouldCallApi
    )
    if (statusCodeOSPlace !== HTTP_STATUS_OK) {
      logger.error(
        `Error fetching statusCodeOSPlace data: ${statusCodeOSPlace}`
      )
    } else {
      logger.info(`getOSPlaces data fetched:`)
    }

    return { getDailySummary, getForecasts, getMeasurements, getOSPlaces }
  } else if (locationType === LOCATION_TYPE_NI) {
    const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
      'osPlacesApiPostcodeNorthernIrelandUrl'
    )
    const mockOsPlacesApiPostcodeNorthernIrelandUrl = config.get(
      'mockOsPlacesApiPostcodeNorthernIrelandUrl'
    )
    const userLocationLocal = formatNorthernIrelandPostcode(
      userLocation.toUpperCase()
    )
    const postcodeNortherIrelandURL = isMockEnabled
      ? `${mockOsPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocationLocal)}&_limit=1`
      : `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocation)}&maxresults=1`
    let [statusCodeNI, getNIPlaces] = await catchProxyFetchError(
      postcodeNortherIrelandURL,
      optionsOAuth,
      true
    )
    if (isMockEnabled) {
      getNIPlaces = {
        results: Array.isArray(getNIPlaces) ? getNIPlaces : [getNIPlaces]
      }
    }
    if (statusCodeNI !== HTTP_STATUS_OK) {
      logger.error(`Error fetching statusCodeNI data: ${statusCodeNI}`)
    } else {
      logger.info(`getNIPlaces data fetched:`)
    }

    return { getDailySummary, getForecasts, getMeasurements, getNIPlaces }
  } else {
    logger.error('Unsupported location type provided:', locationType)
    return null
  }
}

export { fetchData }
