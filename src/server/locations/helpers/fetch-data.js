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
  const tokenUrl = config.get('oauthTokenUrlNIreland')
  const clientId = config.get('clientIdNIreland')
  const clientSecret = config.get('clientSecretNIreland')
  const redirectUri = config.get('redirectUriNIreland')
  const scope = config.get('scopeNIreland')
  const oauthTokenNorthernIrelandTenantId = config.get(
    'oauthTokenNorthernIrelandTenantId'
  )
  logger.info(`OAuth token requested:`)
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
    logger.error(
      `:::::::: POST error fetching TOKEN generation ::::::: ${JSON.stringify(err.message)}`
    )
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error(`Failed to fetch OAuth token: ${JSON.stringify(error)}`)
    throw new Error('Failed to fetch OAuth token')
  }

  const data = await response.json()
  logger.info(`OAuth token fetched:`)
  return data.access_token
}

async function fetchData(locationType, userLocation, request) {
  let optionsOAuth
  if (locationType === 'ni-location') {
    let accessToken
    const savedAccessToken = request.yar.get('savedAccessToken')
    if (savedAccessToken) {
      accessToken = savedAccessToken
      logger.info(`::::::::::: OAuth token from the cache :::::::::`)
    } else {
      accessToken = await fetchOAuthToken()
      request.yar.set('savedAccessToken', accessToken)
      logger.info(`::::::::: OAuth token newly created ::::::::::`)
    }
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
  logger.info(`forecasts data requested:`)
  const forecastsRes = await fetch(`${forecastsAPIurl}`, options).catch(
    (err) => {
      logger.error(`err ${JSON.stringify(err.message)}`)
    }
  )
  let getForecasts
  if (forecastsRes.ok) {
    getForecasts = await forecastsRes.json()
  }
  logger.info(`forecasts data fetched:`)
  logger.info(`measurements data requested:`)
  const measurementsRes = await fetch(measurementsAPIurl, options).catch(
    (err) => {
      logger.error(`err ${JSON.stringify(err.message)}`)
    }
  )
  let getMeasurements
  if (measurementsRes.ok) {
    getMeasurements = await measurementsRes.json()
  }
  logger.info(`measurements data fetched:`)
  const forecastSummaryRes = await proxyFetch(
    forecastSummaryURL,
    options
  ).catch((err) => {
    logger.error(`err ${JSON.stringify(err.message)}`)
  })
  let getDailySummary
  if (forecastSummaryRes.ok) {
    getDailySummary = await forecastSummaryRes.json()
  }
  logger.info(`forecasts summary data fetched:`)
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
    logger.info(`osPlace data requested:`)
    if (!shouldCallApi) {
      const osPlacesRes = await proxyFetch(osPlacesApiUrlFull, options).catch(
        (err) => {
          logger.error(`err ${JSON.stringify(err.message)}`)
        }
      )
      if (osPlacesRes.ok) {
        getOSPlaces = await osPlacesRes.json()
      }
      logger.info(`osPlace data fetched:`)
    }
    return { getDailySummary, getForecasts, getMeasurements, getOSPlaces }
  } else if (locationType === 'ni-location') {
    const osPlacesApiPostcodeNorthernIrelandUrl = config.get(
      'osPlacesApiPostcodeNorthernIrelandUrl'
    )
    const postcodeNortherIrelandURL = `${osPlacesApiPostcodeNorthernIrelandUrl}${encodeURIComponent(userLocation)}&maxresults=1`
    logger.info(`osPlace Northern Ireland data requested:`)
    const northerIrelandRes = await proxyFetch(
      postcodeNortherIrelandURL,
      optionsOAuth
    ).catch((err) => {
      logger.error(
        `:::::::::::  OAuth token error ::::::::: ${JSON.stringify(err.message)}`
      )
    })
    const getNIPlaces = await northerIrelandRes.json().catch((error) => {
      logger.error('Error getNIPlaces:', error)
    })
    logger.info(`osPlace Northern Ireland data fetched:`)
    return { getDailySummary, getForecasts, getMeasurements, getNIPlaces }
  }
}

export { fetchData }
