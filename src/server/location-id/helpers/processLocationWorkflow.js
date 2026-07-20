import { fetchLocationAlert } from '../../air-pollution-breaches/fetch-location-alert.js'
import { fetchDaqiAlert } from '../../air-pollution-breaches/fetch-daqi-alert.js'
import {
  setNotificationLocationSessionValues,
  findLocationResult,
  buildLocationTitle,
  handleNotificationFlowRedirect
} from './location-notification-helpers.js'

function extractWorkflowDependencies(helpers) {
  const {
    logger,
    config,
    constants,
    buildUserLocationMetaCacheKey,
    getUserDataPayload,
    setUserDataPayload,
    setSessionKeyIfSessionExists,
    determineLocationType,
    clearSessionKeyIfExists,
    applyTestModeAndLogDebug,
    getNearestLocationData,
    logAndCalculateSummaryDate,
    persistLocationDataForLocationRoute,
    buildLocationViewData,
    processLocationResult,
    buildNotFoundViewData
  } = helpers

  return {
    logger,
    config,
    constants,
    buildUserLocationMetaCacheKey,
    getUserDataPayload,
    setUserDataPayload,
    setSessionKeyIfSessionExists,
    determineLocationType,
    clearSessionKeyIfExists,
    applyTestModeAndLogDebug,
    getNearestLocationData,
    logAndCalculateSummaryDate,
    persistLocationDataForLocationRoute,
    buildLocationViewData,
    processLocationResult,
    buildNotFoundViewData
  }
}

async function renderLocationOrNotFound({
  locationDetails,
  nearestLocationsRange,
  locationData,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl,
  request,
  locationId,
  nearestLocation,
  locationAlert,
  daqiAlert,
  h,
  LOCATION_NOT_FOUND,
  buildLocationViewData,
  processLocationResult,
  buildNotFoundViewData
}) {
  if (!locationDetails) {
    return h.view(LOCATION_NOT_FOUND, buildNotFoundViewData(lang))
  }

  const viewData = buildLocationViewData({
    locationDetails,
    nearestLocationsRange,
    locationData,
    forecastNum,
    lang,
    getMonth,
    metaSiteUrl,
    request,
    locationId,
    locationAlert,
    daqiAlert
  })

  return processLocationResult(
    request,
    locationData,
    nearestLocation,
    nearestLocationsRange,
    h,
    viewData
  )
}

async function handleNotificationFlowGate({
  request,
  locationData,
  locationId,
  lang,
  logger,
  config,
  REDIRECT_STATUS_CODE,
  buildUserLocationMetaCacheKey,
  getUserDataPayload,
  setUserDataPayload,
  setSessionKeyIfSessionExists,
  clearSessionKeyIfExists,
  h
}) {
  const notificationFlow = request.yar.get('notificationFlow')
  const fromSmsFlow = request.query?.fromSmsFlow === 'true'

  const redirectResponse = await handleNotificationFlowRedirect({
    notificationFlow,
    fromSmsFlow,
    request,
    locationData,
    locationId,
    lang,
    logger,
    config,
    REDIRECT_STATUS_CODE,
    buildUserLocationMetaCacheKey,
    getUserDataPayload,
    setUserDataPayload,
    setSessionKeyIfSessionExists,
    h
  })

  if (notificationFlow && !fromSmsFlow) {
    clearSessionKeyIfExists(request, 'notificationFlow')
  }

  return { redirectResponse }
}

async function resolveNearestLocationContext({
  locationData,
  locationId,
  lang,
  request,
  determineLocationType,
  getNearestLocationData
}) {
  const { getForecasts } = locationData
  const locationType = determineLocationType(locationData)

  return getNearestLocationData(
    locationData,
    getForecasts,
    locationType,
    locationId,
    lang,
    request
  )
}

async function finalizeWorkflowResponse({
  request,
  locationData,
  locationDetails,
  nearestLocationsRange,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl,
  locationId,
  nearestLocation,
  locationAlert,
  daqiAlert,
  h,
  LOCATION_NOT_FOUND,
  persistLocationDataForLocationRoute,
  buildLocationViewData,
  processLocationResult,
  buildNotFoundViewData
}) {
  if (locationData.issueTime && !request.yar.get('locationData')?.issueTime) {
    await persistLocationDataForLocationRoute(request, locationData)
  }

  return renderLocationOrNotFound({
    locationDetails,
    nearestLocationsRange,
    locationData,
    forecastNum,
    lang,
    getMonth,
    metaSiteUrl,
    request,
    locationId,
    nearestLocation,
    locationAlert,
    daqiAlert,
    h,
    LOCATION_NOT_FOUND,
    buildLocationViewData,
    processLocationResult,
    buildNotFoundViewData
  })
}

async function prepareWorkflowRenderContext({
  request,
  locationData,
  locationId,
  lang,
  applyTestModeAndLogDebug,
  determineLocationType,
  getNearestLocationData,
  logAndCalculateSummaryDate
}) {
  await applyTestModeAndLogDebug(request, locationData)

  const nearestContext = await resolveNearestLocationContext({
    locationData,
    locationId,
    lang,
    request,
    determineLocationType,
    getNearestLocationData
  })

  logAndCalculateSummaryDate(locationData)
  return nearestContext
}

function resolveLatlonForAlerts(locationData, logger) {
  const firstResult = locationData?.results?.[0]
  if (firstResult?.latitude != null && firstResult?.longitude != null) {
    logger.info('[resolveLocationSessionAndAlert] resolved lat/lon', {
      lat: firstResult.latitude,
      lon: firstResult.longitude,
      source: 'results[0]'
    })
    return { lat: firstResult.latitude, lon: firstResult.longitude }
  }
  const { lat, lon } = locationData.latlon || {}
  logger.info('[resolveLocationSessionAndAlert] resolved lat/lon', {
    lat,
    lon,
    source: 'locationData.latlon'
  })
  return { lat, lon }
}

function extractSettledAlertResults(
  locationAlertResult,
  daqiAlertResult,
  logger
) {
  if (locationAlertResult.status === 'rejected') {
    logger.warn(
      `fetchLocationAlert failed, rendering page without alert: ${locationAlertResult.reason?.message}`
    )
  }
  if (daqiAlertResult.status === 'rejected') {
    logger.warn(
      `fetchDaqiAlert failed, rendering page without DAQI alert: ${daqiAlertResult.reason?.message}`
    )
  }
  return {
    locationAlert:
      locationAlertResult.status === 'fulfilled'
        ? locationAlertResult.value
        : null,
    daqiAlert:
      daqiAlertResult.status === 'fulfilled' ? daqiAlertResult.value : null
  }
}

// Store current page coordinates in session so notification flows
// (e.g. 'Request a new activation link') always use the correct location,
// and fetch a breach alert for the location if one exists.
async function resolveLocationSessionAndAlert({
  locationData,
  locationId,
  lang,
  request,
  logger,
  setSessionKeyIfSessionExists
}) {
  if (!locationData?.results?.length) {
    return { locationAlert: null, daqiAlert: null }
  }

  const result = findLocationResult(locationData, locationId, logger)
  const gazetteerEntry = result.GAZETTEER_ENTRY || result
  const locationTitle = buildLocationTitle(locationData, gazetteerEntry)
  const { lat, lon } = resolveLatlonForAlerts(locationData, logger)

  setNotificationLocationSessionValues(
    request,
    setSessionKeyIfSessionExists,
    locationTitle,
    locationId,
    lat,
    lon
  )

  const [locationAlertResult, daqiAlertResult] = await Promise.allSettled([
    fetchLocationAlert(lat, lon, locationId, locationTitle, lang, request),
    fetchDaqiAlert(lat, lon, locationId, locationTitle, lang, request)
  ])

  return extractSettledAlertResults(
    locationAlertResult,
    daqiAlertResult,
    logger
  )
}

async function processLocationWorkflow({
  locationData,
  locationId,
  lang,
  getMonth,
  metaSiteUrl,
  request,
  h,
  helpers
}) {
  const workflowDependencies = extractWorkflowDependencies(helpers)
  const { REDIRECT_STATUS_CODE, LOCATION_NOT_FOUND } =
    workflowDependencies.constants

  const { redirectResponse } = await handleNotificationFlowGate({
    request,
    locationData,
    locationId,
    lang,
    h,
    REDIRECT_STATUS_CODE,
    ...workflowDependencies
  })

  if (redirectResponse) {
    return redirectResponse
  }

  const {
    locationDetails,
    forecastNum,
    nearestLocationsRange,
    nearestLocation
  } = await prepareWorkflowRenderContext({
    request,
    locationData,
    locationId,
    lang,
    ...workflowDependencies
  })

  const { locationAlert, daqiAlert } = locationDetails
    ? await resolveLocationSessionAndAlert({
        locationData,
        locationId,
        lang,
        request,
        logger: workflowDependencies.logger,
        setSessionKeyIfSessionExists:
          workflowDependencies.setSessionKeyIfSessionExists
      })
    : { locationAlert: null, daqiAlert: null }

  return finalizeWorkflowResponse({
    request,
    locationData,
    locationDetails,
    nearestLocationsRange,
    forecastNum,
    lang,
    getMonth,
    metaSiteUrl,
    locationId,
    nearestLocation,
    locationAlert,
    daqiAlert,
    h,
    LOCATION_NOT_FOUND,
    ...workflowDependencies
  })
}

export { processLocationWorkflow }
