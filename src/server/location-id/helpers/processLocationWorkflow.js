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
    const point = new OsGridRef(gazetteerEntry.GEOMETRY_X, gazetteerEntry.GEOMETRY_Y)
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
  const { lat, lon } = await resolveNotificationCoordinates(gazetteerEntry, result)

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

  // '' DEBUG: Log session data immediately after setting to verify persistence
  logger.info('Session debug - SET operation complete', {
    sessionId: request.yar.id,
    operation: 'SET',
    keysSet: ['location', 'locationId', 'latitude', 'longitude'],
    values: {
      location: locationTitle,
      locationId,
      latitude: lat,
      longitude: lon
    },
    verifyImmediate: {
      location: request.yar.get('location'),
      locationId: request.yar.get('locationId'),
      latitude: request.yar.get('latitude'),
      longitude: request.yar.get('longitude')
    }
  })

  logger.info(
    `[DEBUG processLocationWorkflow] Updated session location data:`,
    {
      location: locationTitle,
      locationId,
      lat,
      lon,
      hasLat: !!lat,
      hasLon: !!lon,
      geometryX: gazetteerEntry.GEOMETRY_X,
      geometryY: gazetteerEntry.GEOMETRY_Y
    }
  )
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

  logger.info(
    `[DEBUG processLocationWorkflow] Redirecting to ${notificationFlow} confirm details (notificationFlow=${notificationFlow})`
  )

  return buildNotificationRedirectResponse(
    notificationFlow,
    lang,
    h,
    config,
    REDIRECT_STATUS_CODE
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

  const { REDIRECT_STATUS_CODE, LOCATION_NOT_FOUND } = constants

  // '' Check if user is in notification registration flow (SMS or Email) from multiple-results page
  const notificationFlow = request.yar.get('notificationFlow')
  const fromSmsFlow = request.query?.fromSmsFlow === 'true'

  const notificationRedirectResponse = await handleNotificationFlowRedirect({
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

  if (notificationRedirectResponse) {
    return notificationRedirectResponse
  }

  const { getForecasts } = locationData
  const locationType = determineLocationType(locationData)

  // '' If user is viewing a location page (not in notification flow), clear any stale notification flags
  // '' This prevents the notification loop from persisting when user navigates away
  if (notificationFlow && !fromSmsFlow) {
    clearSessionKeyIfExists(request, 'notificationFlow')
  }

  await applyTestModeAndLogDebug(request, locationData)

  const {
    locationDetails,
    forecastNum,
    nearestLocationsRange,
    nearestLocation
  } = await getNearestLocationData(
    locationData,
    getForecasts,
    locationType,
    locationId,
    lang,
    request
  )

  logAndCalculateSummaryDate(locationData)

  if (locationData.issueTime && !request.yar.get('locationData')?.issueTime) {
    await persistLocationDataForLocationRoute(request, locationData)
  }

  if (locationDetails) {
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
  } else {
    return h.view(LOCATION_NOT_FOUND, buildNotFoundViewData(lang))
  }
}

export { processLocationWorkflow }
