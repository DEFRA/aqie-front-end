import { config } from '../../../config/index.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { catchFetchError } from '../../common/helpers/catch-fetch-error.js'
import { catchProxyFetchError } from '../../common/helpers/catch-proxy-fetch-error.js'
import {
  LOCATION_TYPE_NI,
  SYMBOLS_ARRAY,
  HTTP_STATUS_OK,
  LOCATION_TYPE_UK,
  ROUND_OF_SIX
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
  logger.info(`Fetching OAuth token from clientSecret: ${clientSecret}`)
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

const refreshOAuthToken = async (request) => {
  const accessToken = await fetchOAuthToken()
  request.yar.clear('savedAccessToken')
  request.yar.set('savedAccessToken', accessToken)
  return accessToken
}

const handleUKLocationData = async (
  userLocation,
  searchTerms,
  secondSearchTerm
) => {
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

  const shouldCallApi = !SYMBOLS_ARRAY.some((symbol) =>
    userLocation.includes(symbol)
  )

  const [statusCodeOSPlace, getOSPlaces] = await catchProxyFetchError(
    osNamesApiUrlFull,
    options,
    shouldCallApi
  )

  if (statusCodeOSPlace !== HTTP_STATUS_OK) {
    logger.error(`Error fetching statusCodeOSPlace data: ${statusCodeOSPlace}`)
  } else {
    logger.info(`getOSPlaces data fetched:`)
  }

  return getOSPlaces
}

const handleNILocationData = async (userLocation, optionsOAuth) => {
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

  return getNIPlaces
}

const fetchForecasts = async () => {
  const forecastsAPIurl = config.get('forecastsApiUrl')
  const [forecastError, getForecasts] = await catchFetchError(
    forecastsAPIurl,
    options
  )

  if (forecastError) {
    logger.error(`Error fetching forecasts data: ${forecastError.message}`)
  } else {
    logger.info(`forecasts data fetched:`)
  }

  return getForecasts
}

export const fetchMeasurements = async (
  latitude,
  longitude,
  useNewRicardoMeasurementsEnabled
) => {
  const formatCoordinate = (coord) => Number(coord).toFixed(ROUND_OF_SIX)

  const fetchDataFromApi = async (url) => {
    const [error, getMeasurements] = await catchFetchError(url, options)
    if (error) {
      logger.error(`Error fetching data: ${error.message}`)
      return []
    }
    logger.info(`Data fetched successfully.`)
    return getMeasurements || []
  }

  try {
    if (useNewRicardoMeasurementsEnabled) {
      logger.info(
        `Using mock measurements with latitude: ${latitude}, longitude: ${longitude}`
      )

      const queryParams = new URLSearchParams({
        page: '1',
        'latest-measurement': 'true',
        'with-closed': 'false',
        'with-pollutants': 'true',
        latitude: formatCoordinate(latitude),
        longitude: formatCoordinate(longitude),
        'networks[]': '4',
        totalItems: '3',
        distance: '60',
        'daqi-pollutant': 'true'
      })

      const baseUrl = config.get('ricardoMeasurementsApiUrl')
      const newRicardoMeasurementsApiUrl = `${baseUrl}?${queryParams.toString()}`
      logger.info(
        `New Ricardo measurements API URL: ${newRicardoMeasurementsApiUrl}`
      )

      return await fetchDataFromApi(newRicardoMeasurementsApiUrl)
    }

    // Call old measurements API without query parameters
    const measurementsAPIurl = config.get('measurementsApiUrl')
    logger.info(`Old measurements API URL: ${measurementsAPIurl}`)
    return await fetchDataFromApi(measurementsAPIurl)
  } catch (err) {
    logger.error(`Unexpected error in fetchMeasurements: ${err.message}`)
    return []
  }
}

const fetchDailySummary = async () => {
  const forecastSummaryURL = config.get('forecastSummaryUrl')
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

  return getDailySummary
}

async function fetchData(
  request,
  { locationType, userLocation, searchTerms, secondSearchTerm }
) {
  let optionsOAuth
  let accessToken

  if (locationType === LOCATION_TYPE_NI && !isMockEnabled) {
    const savedAccessToken = request.yar.get('savedAccessToken')
    accessToken = savedAccessToken || (await refreshOAuthToken(request))

    optionsOAuth = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }

  const getForecasts = await fetchForecasts()
  const getDailySummary = await fetchDailySummary()

  if (locationType === LOCATION_TYPE_UK) {
    const getOSPlaces = await handleUKLocationData(
      userLocation,
      searchTerms,
      secondSearchTerm
    )
    return { getDailySummary, getForecasts, getOSPlaces }
  } else if (locationType === LOCATION_TYPE_NI) {
    const getNIPlaces = await handleNILocationData(userLocation, optionsOAuth)
    return { getDailySummary, getForecasts, getNIPlaces }
  } else {
    logger.error('Unsupported location type provided:', locationType)
    return null
  }
}

export { fetchData }
