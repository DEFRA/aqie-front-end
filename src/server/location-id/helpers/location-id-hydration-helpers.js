import { config } from '../../../config/index.js'
import { LOCATION_TYPE_UK } from '../../data/constants.js'
import { fetchData } from '../../locations/helpers/fetch-data.js'
import { createURLRouteBookmarks } from '../../locations/helpers/create-bookmark-ids.js'
import {
  buildSharedLocationPayloadCacheKey,
  setSharedLocationPayload
} from '../../common/helpers/location-shared-cache.js'

function normalizeLocationIdTerms(locationId = '') {
  const decodedId = decodeURIComponent(locationId || '').toLowerCase()
  const [primaryPart = '', ...secondaryParts] = decodedId.split('_')

  return {
    searchTerms: primaryPart.replaceAll('-', ' ').trim(),
    secondSearchTerm: secondaryParts.join('_').replaceAll('-', ' ').trim()
  }
}

function shouldSkipStatelessHydration(env, locationId) {
  return env === 'test' || !locationId
}

function hasPlacesResults(getOSPlaces) {
  return Boolean(
    Array.isArray(getOSPlaces?.results) && getOSPlaces.results.length > 0
  )
}

function hasLocationIdMatch(selectedMatchesAddedIDs, locationId) {
  return selectedMatchesAddedIDs.some(
    (item) => item?.GAZETTEER_ENTRY?.ID === locationId
  )
}

async function hydrateLocationDataForStatelessLocationId(
  request,
  locationId,
  lang,
  logger
) {
  const env = config.get('env') || config.get('nodeEnv')
  if (shouldSkipStatelessHydration(env, locationId)) {
    return null
  }

  const { searchTerms, secondSearchTerm } = normalizeLocationIdTerms(locationId)
  const userLocation = [searchTerms, secondSearchTerm].filter(Boolean).join(' ')

  if (!userLocation) {
    return null
  }

  try {
    const { getOSPlaces, getForecasts, getDailySummary } = await fetchData(
      request,
      {
        locationType: LOCATION_TYPE_UK,
        userLocation,
        searchTerms,
        secondSearchTerm
      }
    )

    if (!hasPlacesResults(getOSPlaces)) {
      return null
    }

    const { selectedMatchesAddedIDs } = createURLRouteBookmarks([
      ...getOSPlaces.results
    ])

    if (!hasLocationIdMatch(selectedMatchesAddedIDs, locationId)) {
      return null
    }

    const hydratedLocationData = {
      results: selectedMatchesAddedIDs,
      getForecasts: getForecasts?.forecasts,
      dailySummary: getDailySummary,
      locationType: LOCATION_TYPE_UK,
      lang,
      urlRoute: locationId
    }

    const cacheKey = buildSharedLocationPayloadCacheKey(
      request,
      hydratedLocationData
    )
    await setSharedLocationPayload(request, cacheKey, hydratedLocationData)

    logger.info(`Hydrated locationData for id='${locationId}'`)

    return hydratedLocationData
  } catch (error) {
    logger.warn(`Hydration failed for id='${locationId}': ${error.message}`)
    return null
  }
}

export { hydrateLocationDataForStatelessLocationId }
