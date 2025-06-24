/* eslint-disable prettier/prettier */
import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { catchFetchError } from '~/src/server/common/helpers/catch-fetch-error'
import { catchProxyFetchError } from '~/src/server/common/helpers/catch-proxy-fetch-error'
import { LOCATION_TYPE_NI, LOCATION_TYPE_UK } from '~/src/server/data/constants'
import { getNIPlaces } from '~/src/server/locations/helpers/get-ni-places'
import { getOSPlaces } from '~/src/server/locations/helpers/get-os-places'

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
  // Invoking token API
  const [statusCodeToken, dataToken] = await catchProxyFetchError(
    url,
    options,
    true
  )
  if (statusCodeToken !== 200) {
    logger.error('Error OAuth statusCodeToken fetched:', statusCodeToken)
  } else {
    logger.info(`OAuth token fetched:::`)
  }

  return dataToken.access_token
}

const SUCCESS_STATUS_CODE = 200 // Define constant for magic number

async function fetchData(
  request,
  h,
  { locationType, userLocation, searchTerms, secondSearchTerm }
) {
  let optionsOAuth
  let savedAccessToken
  const northernIrelandPostcodeRegex = /^BT\d{1,2}\s?\d?[A-Z]{0,2}$/
  const niPoscode = northernIrelandPostcodeRegex.test(userLocation)
  try {
    if (locationType === LOCATION_TYPE_NI && !isMockEnabled) {
      savedAccessToken = request.yar.get('savedAccessToken')
      if (!savedAccessToken) {
        await fetchOAuthToken()
      }
    }
    const SYMBOLS_ARRAY = ['@', '#', '$', '%'] // Example symbols array
    const forecastSummaryURL = config.get('forecastSummaryUrl')
    const forecastsAPIurl = config.get('forecastsApiUrl')
    const measurementsAPIurl = config.get('measurementsApiUrl')

    const [forecastError, getForecasts] = await catchFetchError(
      forecastsAPIurl,
      options
    )
    if (forecastError) {
      throw new Error(`Error fetching forecasts data: ${forecastError.message}`)
    }

    const [errorMeasurements, getMeasurements] = await catchFetchError(
      measurementsAPIurl,
      options
    )
    if (errorMeasurements) {
      throw new Error(
        `Error fetching Measurements data: ${errorMeasurements.message}`
      )
    }

    const [statusCodeSummary, getDailySummary] = await catchProxyFetchError(
      forecastSummaryURL,
      options,
      true
    )
    if (statusCodeSummary !== SUCCESS_STATUS_CODE) {
      throw new Error(
        `Error fetching statusCodeSummary data: ${statusCodeSummary}`
      )
    }
    let shouldCallApi = !SYMBOLS_ARRAY.some((symbol) =>
      userLocation.includes(symbol)
    )
    if (niPoscode) {
      shouldCallApi = false
    }
    if (locationType === LOCATION_TYPE_UK) {
      const getOSPlacesData = await getOSPlaces(
        userLocation,
        searchTerms,
        secondSearchTerm,
        shouldCallApi,
        options
      )
      logger.info(`getOSPlaces data fetched:`)

      return {
        getDailySummary,
        getForecasts,
        getMeasurements,
        getOSPlaces: { ...getOSPlacesData }
      }
    } else if (locationType === LOCATION_TYPE_NI) {
      const getNIPlacesData = await getNIPlaces(
        userLocation,
        isMockEnabled,
        optionsOAuth
      )
      logger.info(`getNIPlaces data fetched:`)

      return {
        getDailySummary,
        getForecasts,
        getMeasurements,
        getNIPlaces: getNIPlacesData
      }
    } else {
      // '' Handle the case where locationType is neither 'uk-location' nor LOCATION_TYPE_NI
      logger.error('Invalid locationType provided to fetchData')
      return null
    }
  } catch (error) {
    logger.error(error.message)
    return null
  } finally {
    // Optional cleanup logic can be added here if needed
  }
}

export { fetchData }
