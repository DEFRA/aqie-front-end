function setNotificationLocationSessionValues(
  request,
  setSessionKeyIfSessionExists,
  location,
  locationId,
  latitude,
  longitude
) {
  setSessionKeyIfSessionExists(request, 'location', location)
  setSessionKeyIfSessionExists(request, 'locationId', locationId)
  setSessionKeyIfSessionExists(request, 'latitude', latitude)
  setSessionKeyIfSessionExists(request, 'longitude', longitude)
}

function findLocationResult(locationData, locationId, logger) {
  const result = locationData.results.find((r) => {
    const id = r.GAZETTEER_ENTRY?.ID || r.ID
    return id === locationId
  })

  if (result) {
    return result
  }

  logger.warn(
    `No result found matching locationId: ${locationId}, using first result`
  )
  return locationData.results[0]
}

function buildLocationTitle(locationData, gazetteerEntry) {
  // '' Build proper location title from gazetteerEntry instead of using page title
  let locationTitle = locationData.headerTitle

  // '' If headerTitle is not set or is a generic page title, build from gazetteerEntry
  if (!locationTitle || locationTitle === 'Locations matching') {
    const name = gazetteerEntry.NAME2 || gazetteerEntry.NAME1 || ''
    const district =
      gazetteerEntry.DISTRICT_BOROUGH || gazetteerEntry.COUNTY_UNITARY || ''
    locationTitle = district ? `${name}, ${district}` : name
  }

  return locationTitle
}

async function resolveNotificationCoordinates(gazetteerEntry, result) {
  if (gazetteerEntry.GEOMETRY_X && gazetteerEntry.GEOMETRY_Y) {
    // '' Import OsGridRef for coordinate conversion
    const OsGridRef = (await import('mt-osgridref')).default
    const point = new OsGridRef(
      gazetteerEntry.GEOMETRY_X,
      gazetteerEntry.GEOMETRY_Y
    )
    const latlon = OsGridRef.osGridToLatLong(point)
    return { lat: latlon._lat, lon: latlon._lon }
  }

  // '' Fallback to direct latitude/longitude if available
  return {
    lat: gazetteerEntry.LATITUDE || gazetteerEntry.latitude || result.latitude,
    lon:
      gazetteerEntry.LONGITUDE || gazetteerEntry.longitude || result.longitude
  }
}

async function hydrateNotificationMetaFromCache({
  request,
  locationId,
  lang,
  logger,
  buildUserLocationMetaCacheKey,
  getUserDataPayload,
  setSessionKeyIfSessionExists
}) {
  const userLocationMetaCacheKey = buildUserLocationMetaCacheKey(
    request,
    locationId,
    lang
  )
  const cachedUserLocationMeta = await getUserDataPayload(
    request,
    userLocationMetaCacheKey
  )

  if (!cachedUserLocationMeta) {
    return userLocationMetaCacheKey
  }

  setNotificationLocationSessionValues(
    request,
    setSessionKeyIfSessionExists,
    cachedUserLocationMeta.location,
    cachedUserLocationMeta.locationId,
    cachedUserLocationMeta.latitude,
    cachedUserLocationMeta.longitude
  )

  logger.info(
    `[USER DATA CACHE] Cache hit for location notification metadata (key='${userLocationMetaCacheKey}')`
  )

  return userLocationMetaCacheKey
}

async function updateNotificationMetaFromResults({
  locationData,
  locationId,
  request,
  logger,
  userLocationMetaCacheKey,
  setSessionKeyIfSessionExists,
  setUserDataPayload
}) {
  if (!locationData?.results?.length) {
    return
  }

  const result = findLocationResult(locationData, locationId, logger)
  const gazetteerEntry = result.GAZETTEER_ENTRY || result
  const locationTitle = buildLocationTitle(locationData, gazetteerEntry)
  const { lat, lon } = await resolveNotificationCoordinates(
    gazetteerEntry,
    result
  )

  setNotificationLocationSessionValues(
    request,
    setSessionKeyIfSessionExists,
    locationTitle,
    locationId,
    lat,
    lon
  )

  await setUserDataPayload(request, userLocationMetaCacheKey, {
    location: locationTitle,
    locationId,
    latitude: lat,
    longitude: lon
  })
}

function buildNotificationRedirectResponse(
  notificationFlow,
  lang,
  h,
  config,
  REDIRECT_STATUS_CODE
) {
  if (notificationFlow === 'sms') {
    const smsConfirmDetailsPath = config.get('notify.smsConfirmDetailsPath')
    return h
      .redirect(`${smsConfirmDetailsPath}?lang=${lang}`)
      .code(REDIRECT_STATUS_CODE)
  }

  if (notificationFlow === 'email') {
    const emailDetailsPath = config.get('notify.emailDetailsPath')
    return h
      .redirect(`${emailDetailsPath}?lang=${lang}`)
      .code(REDIRECT_STATUS_CODE)
  }

  return null
}

async function handleNotificationFlowRedirect({
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
}) {
  if (!notificationFlow || !fromSmsFlow) {
    return null
  }

  const userLocationMetaCacheKey = await hydrateNotificationMetaFromCache({
    request,
    locationId,
    lang,
    logger,
    buildUserLocationMetaCacheKey,
    getUserDataPayload,
    setSessionKeyIfSessionExists
  })

  await updateNotificationMetaFromResults({
    locationData,
    locationId,
    request,
    logger,
    userLocationMetaCacheKey,
    setSessionKeyIfSessionExists,
    setUserDataPayload
  })

  return buildNotificationRedirectResponse(
    notificationFlow,
    lang,
    h,
    config,
    REDIRECT_STATUS_CODE
  )
}

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
    locationId
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

  // '' Store current page coordinates in session so notification flows
  // '' (e.g. 'Request a new activation link') always use the correct location
  if (locationDetails && locationData?.results?.length) {
    const result = findLocationResult(
      locationData,
      locationId,
      workflowDependencies.logger
    )
    const gazetteerEntry = result.GAZETTEER_ENTRY || result
    const locationTitle = buildLocationTitle(locationData, gazetteerEntry)
    const { lat, lon } = locationData.latlon || {}
    setNotificationLocationSessionValues(
      request,
      workflowDependencies.setSessionKeyIfSessionExists,
      locationTitle,
      locationId,
      lat,
      lon
    )
  }

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
    h,
    LOCATION_NOT_FOUND,
    ...workflowDependencies
  })
}

export { processLocationWorkflow }
