/* eslint-disable prettier/prettier */
import { proxyFetch } from '~/src/helpers/proxy-fetch.js'
import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const options = {
  method: 'get',
  headers: { 'Content-Type': 'text/json', preserveWhitespace: true }
}
const logger = createLogger()

const fetchOAuthToken = async () => {
  logger.info(`::::::::::::: fetchOAuthToken :::::::::::`)
  const tokenUrl = config.get('oauthTokenUrlNIreland')
  const clientId = config.get('clientIdNIreland')
  const clientSecret = config.get('clientSecretNIreland')
  const redirectUri = config.get('redirectUriNIreland')
  const scope = config.get('scopeNIreland')
  const oauthTokenNorthernIrelandTenantId = config.get(
    'oauthTokenNorthernIrelandTenantId'
  )
  logger.info(`::::::::::::: fetchOAuthToken proxyFetch ::::::::::::::::`)

  logger.info(
    `::::::::::::: fetchOAuthToken tokenUrl:::::::::::::::: ${tokenUrl}`
  )
  logger.info(
    `::::::::::::: fetchOAuthToken oauthTokenNorthernIrelandTenantId  :::::::::::::::: ${oauthTokenNorthernIrelandTenantId}`
  )
  logger.info(
    `::::::::::::: fetchOAuthToken clientId  :::::::::::::::: ${clientId}`
  )
  logger.info(
    `::::::::::::: fetchOAuthToken clientSecret  :::::::::::::::: ${clientSecret}`
  )
  logger.info(
    `::::::::::::: fetchOAuthToken redirectUri  :::::::::::::::: ${redirectUri}`
  )
  logger.info(
    `::::::::::::: fetchOAuthToken scope   :::::::::::::::::: ${scope}`
  )
  const response = await proxyFetch(
    `${tokenUrl}/${oauthTokenNorthernIrelandTenantId}/oauth2/v2.0/token`,
    {
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
  ).catch((err) => {
    logger.info(
      `:::::::: POST error fetching TOKEN generation ::::::: ${JSON.stringify(err.message)}`
    )
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error(`Failed to fetch OAuth token: ${JSON.stringify(error)}`)
    throw new Error('Failed to fetch OAuth token')
  }

  const data = await response.json()
  logger.info(`OAuth token fetched: ${JSON.stringify(data)}`)
  return data.access_token
}

async function fetchData(locationType, userLocation, request) {
  let optionsOAuth
  logger.info(
    `::::::::::::: fetchData userLocation ::::::::::: ${userLocation}`
  )
  logger.info(
    `::::::::::::: fetchData locationType ::::::::::: ${locationType}`
  )
  if (locationType === 'ni-location') {
    let accessToken
    const savedAccessToken = request.yar.get('savedAccessToken')
    logger.info(`::::::::::::: fetchData ::::::::::: ${savedAccessToken}`)
    if (savedAccessToken) {
      accessToken = savedAccessToken
      logger.info(
        `::::::::::::: Access token from session ::::::::::: ${accessToken}`
      )
    } else {
      accessToken = await fetchOAuthToken()
      request.yar.set('savedAccessToken', accessToken)
      logger.info(
        `::::::::::::  Access token from fetch ::::::::::::: ${accessToken}`
      )
    }
    logger.info(`:::::::::::: Access token :::::::::::: ${accessToken}`)
    optionsOAuth = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  }
  const symbolsArr = ['%', '$', '&', '#', '!', '¬', '`']
  let getOSPlaces = { data: [] }
  const forecastSummaryURL = config.get('forecastSummaryUrl')
  const forecastsAPIurl = config.get('forecastsApiUrl')
  const measurementsAPIurl = config.get('measurementsApiUrl')

  logger.info(`:::::::: forecastSummaryURL ::::::: ${forecastSummaryURL}`)
  logger.info(`:::::::: forecastsAPIurl ::::::: ${forecastsAPIurl}`)
  logger.info(`:::::::: measurementsAPIurl ::::::: ${measurementsAPIurl}`)
  const forecastsRes = await fetch(`${forecastsAPIurl}`, options).catch(
    (err) => {
      logger.info(`err ${JSON.stringify(err.message)}`)
    }
  )
  let getForecasts
  logger.info(`:::::::: forecastsRes.ok ::::::: ${forecastsRes.ok}`)
  if (forecastsRes.ok) {
    getForecasts = await forecastsRes.json()
  }
  logger.info(
    `:::::::::::::::;; getForecasts inside fetch-data :::::::::::::::::: ${getForecasts}`
  )
  const measurementsRes = await fetch(measurementsAPIurl, options).catch(
    (err) => {
      logger.info(`err ${JSON.stringify(err.message)}`)
    }
  )
  logger.info(
    `:::::::::::::::;; measurementsRes :::::::::::::::::: ${measurementsRes}`
  )
  logger.info(
    `:::::::::::::::;; measurementsRes.ok :::::::::::::::::: ${measurementsRes.ok}`
  )
  let getMeasurements
  if (measurementsRes.ok) {
    getMeasurements = await measurementsRes.json()
  }
  logger.info(
    `:::::::::::::::;; getMeasurements inside fetch-data :::::::::::::::::: ${getMeasurements}`
  )
  const forecastSummaryRes = await proxyFetch(
    forecastSummaryURL,
    options
  ).catch((err) => {
    logger.info(`err ${JSON.stringify(err.message)}`)
  })
  logger.info(
    `:::::::::::::::;; forecastSummaryRes :::::::::::::::::: ${forecastSummaryRes}`
  )
  logger.info(
    `:::::::::::::::;; forecastSummaryRes.ok :::::::::::::::::: ${forecastSummaryRes.ok}`
  )
  let getDailySummary
  if (forecastSummaryRes.ok) {
    getDailySummary = await forecastSummaryRes.json()
  }
  logger.info(
    `:::::::::::::::;; getDailySummary inside fetch-data :::::::::::::::::: ${getDailySummary}`
  )
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
    if (!shouldCallApi) {
      const osPlacesRes = await proxyFetch(osPlacesApiUrlFull, options).catch(
        (err) => {
          logger.info(`err ${JSON.stringify(err.message)}`)
        }
      )
      if (osPlacesRes.ok) {
        getOSPlaces = await osPlacesRes.json()
      }
    }
    return { getDailySummary, getForecasts, getMeasurements, getOSPlaces }
  } else if (locationType === 'ni-location') {
    const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
      'osPlacesApiPostcodeNorthernIrelandUrl'
    )
    logger.info(
      `:::::::::::::::;; osPlacesApiPostcodeNorthernIrelandUrl :::::::::::::::::: ${osPlacesApiPostcodeNorthernIrelandUrl}`
    )
    logger.info(
      `:::::::::::::::;; userLocation :::::::::::::::::: ${userLocation}`
    )
    const postcodeNortherIrelandURL = `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocation)}&maxresults=1`
    logger.info(
      `::::::::::::: postcodeNortherIrelandURL ::::::::::: ${postcodeNortherIrelandURL}`
    )
    logger.info(
      `::::::::::::: optionsOAuth ::::::::::: ${JSON.stringify(optionsOAuth)}`
    )
    const northerIrelandRes = await proxyFetch(
      postcodeNortherIrelandURL,
      optionsOAuth
    ).catch((err) => {
      logger.info(
        `:::::::::::  OAuth token error ::::::::: ${JSON.stringify(err.message)}`
      )
    })
    logger.info(
      `::::::::::::: northerIrelandRes ::::::::::: ${JSON.stringify(northerIrelandRes)}`
    )
    const getNIPlaces = await northerIrelandRes.json().catch((error) => {
      logger.error('Error getNIPlaces:', error)
    })

    logger.info(
      `::::::::: getNIPlaces ::::::::::::: ${JSON.stringify(getNIPlaces)}`
    )
    return { getNIPlaces }
  }
}

export { fetchData }
