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

  if (notificationFlow && fromSmsFlow) {
    const userLocationMetaCacheKey = buildUserLocationMetaCacheKey(
      request,
      locationId,
      lang
    )
    const cachedUserLocationMeta = await getUserDataPayload(
      request,
      userLocationMetaCacheKey
    )

    if (cachedUserLocationMeta) {
      setSessionKeyIfSessionExists(
        request,
        'location',
        cachedUserLocationMeta.location
      )
      setSessionKeyIfSessionExists(
        request,
        'locationId',
        cachedUserLocationMeta.locationId
      )
      setSessionKeyIfSessionExists(
        request,
        'latitude',
        cachedUserLocationMeta.latitude
      )
      setSessionKeyIfSessionExists(
        request,
        'longitude',
        cachedUserLocationMeta.longitude
      )

      logger.info(
        `[USER DATA CACHE] Cache hit for location notification metadata (key='${userLocationMetaCacheKey}')`
      )
    }

    // '' Update session with location data for notification
    if (
      locationData &&
      locationData.results &&
      locationData.results.length > 0
    ) {
      // '' Find the result that matches the locationId (not just the first one)
      let result = locationData.results.find((r) => {
        const id = r.GAZETTEER_ENTRY?.ID || r.ID
        return id === locationId
      })

      // '' Fallback to first result if no match found (shouldn't happen)
      if (!result) {
        logger.warn(
          `No result found matching locationId: ${locationId}, using first result`
        )
        result = locationData.results[0]
      }

      const gazetteerEntry = result.GAZETTEER_ENTRY || result

      // '' Build proper location title from gazetteerEntry instead of using page title
      let locationTitle = locationData.headerTitle

      // '' If headerTitle is not set or is a generic page title, build from gazetteerEntry
      if (!locationTitle || locationTitle === 'Locations matching') {
        const name = gazetteerEntry.NAME2 || gazetteerEntry.NAME1 || ''
        const district =
          gazetteerEntry.DISTRICT_BOROUGH || gazetteerEntry.COUNTY_UNITARY || ''
        locationTitle = district ? `${name}, ${district}` : name
      }

      // '' Convert British National Grid coordinates (GEOMETRY_X/Y) to lat/long
      let lat, lon
      if (gazetteerEntry.GEOMETRY_X && gazetteerEntry.GEOMETRY_Y) {
        // '' Import OsGridRef for coordinate conversion
        const OsGridRef = (await import('mt-osgridref')).default
        const point = new OsGridRef(
          gazetteerEntry.GEOMETRY_X,
          gazetteerEntry.GEOMETRY_Y
        )
        const latlon = OsGridRef.osGridToLatLong(point)
        lat = latlon._lat
        lon = latlon._lon
      } else {
        // '' Fallback to direct latitude/longitude if available
        lat =
          gazetteerEntry.LATITUDE || gazetteerEntry.latitude || result.latitude
        lon =
          gazetteerEntry.LONGITUDE ||
          gazetteerEntry.longitude ||
          result.longitude
      }

      setSessionKeyIfSessionExists(request, 'location', locationTitle)
      setSessionKeyIfSessionExists(request, 'locationId', locationId)
      setSessionKeyIfSessionExists(request, 'latitude', lat)
      setSessionKeyIfSessionExists(request, 'longitude', lon)

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

    logger.info(
      `[DEBUG processLocationWorkflow] Redirecting to ${notificationFlow} confirm details (notificationFlow=${notificationFlow})`
    )

    if (notificationFlow === 'sms') {
      const smsConfirmDetailsPath = config.get('notify.smsConfirmDetailsPath')
      return h
        .redirect(`${smsConfirmDetailsPath}?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
    } else if (notificationFlow === 'email') {
      const emailDetailsPath = config.get('notify.emailDetailsPath')
      return h
        .redirect(`${emailDetailsPath}?lang=${lang}`)
        .code(REDIRECT_STATUS_CODE)
    }
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
