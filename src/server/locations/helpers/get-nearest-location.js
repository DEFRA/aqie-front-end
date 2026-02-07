import * as geolib from 'geolib'
import moment from 'moment-timezone'
import proj4 from 'proj4'
import {
  getNearLocation,
  convertPointToLonLat,
  coordinatesTotal,
  pointsInRange
} from './location-util.js'
import { getPollutantLevel } from './pollutant-level-calculation.js'
import { getPollutantLevelCy } from './cy/pollutant-level-calculation.js'
import {
  LANG_CY,
  FORECAST_DAY_SLICE_LENGTH,
  NEARBY_LOCATIONS_COUNT
} from '../../data/constants.js'
import { fetchMeasurements } from './fetch-data.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()
const METERS_TO_MILES = 0.000621371192

// '' Define Irish Grid projection for coordinate conversion
const irishGrid =
  '+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +units=m +no_defs +type=crs'
const wgs84 = 'EPSG:4326'

/**
 * '' Convert Irish Grid coordinates to WGS84 if detected
 * Irish Grid values are typically > 10,000 (meters), WGS84 values are < 180 (degrees)
 * '' NOTE: This app uses [latitude, longitude] format (not GeoJSON standard)
 */
function convertIrishGridIfNeeded(coord1, coord2) {
  // '' Check if coordinates are Irish Grid (both > 10000)
  if (coord1 > 10000 && coord1 < 500000 && coord2 > 10000 && coord2 < 600000) {
    try {
      logger.info(
        `[IRISH GRID] Converting forecast coordinates: [${coord1}, ${coord2}]`
      )
      const [lon, lat] = proj4(irishGrid, wgs84, [coord1, coord2])
      logger.info(`[IRISH GRID] Converted to WGS84: lat=${lat}, lon=${lon}`)
      // '' Return in app's [latitude, longitude] format
      return { lat, lon, converted: true }
    } catch (error) {
      logger.error(
        `[IRISH GRID] Conversion failed for [${coord1}, ${coord2}]: ${error.message}`
      )
      // '' Fallback: treat as [lat, lon]
      return { lat: coord1, lon: coord2, converted: false }
    }
  }

  // '' Default: app's [latitude, longitude] format (not GeoJSON)
  return { lat: coord1, lon: coord2, converted: false }
}

// Helper to get latlon and forecastCoordinates //
export function getLatLonAndForecastCoords(
  matches,
  location,
  index,
  forecasts
) {
  const latlon =
    matches.length > 0 ? convertPointToLonLat(matches, location, index) : {}
  const forecastCoordinates =
    matches.length > 0 ? coordinatesTotal(forecasts, location) : []
  return { latlon, forecastCoordinates }
}

// Helper to build forecastNum
export function buildForecastNum(matches, nearestLocation, forecastDay) {
  // '' Return empty array if no matches or nearestLocation is not a valid array
  if (
    !matches ||
    matches.length === 0 ||
    !Array.isArray(nearestLocation) ||
    nearestLocation.length === 0
  ) {
    return []
  }

  return nearestLocation.map((current) => {
    // '' Guard against missing forecast property
    if (!current || !Array.isArray(current.forecast)) {
      return []
    }

    let todayDate = []
    const otherdays = []
    for (const { day, value } of current.forecast) {
      if (day === forecastDay) {
        todayDate = [{ today: value }]
      } else {
        otherdays.push({ [day]: value })
      }
    }
    return [...todayDate, ...otherdays]
  })
}

// Helper to validate pollutant values (allow only numbers >= 0)
export function isValidNonNegativeNumber(value) {
  // Coerce to number (handles numeric strings)
  const num = Number(value)
  // Reject NaN, infinities, null/undefined, and negatives
  return Number.isFinite(num) && num >= 0
}

// Helper to build pollutants object for a measurement
export function buildPollutantsObject(curr, lang) {
  const newpollutants = []
  for (const pollutant of Object.keys(curr.pollutants)) {
    const polValue = curr.pollutants[pollutant].value
    // Only proceed if the value is a valid non‑negative number
    if (!isValidNonNegativeNumber(polValue)) {
      continue
    }
    const { getDaqi, getBand } =
      lang === LANG_CY
        ? getPollutantLevelCy(polValue, pollutant)
        : getPollutantLevel(polValue, pollutant)
    const formatHour = moment(curr.pollutants[pollutant].time.date).format('ha')
    const dayNumber = moment(curr.pollutants[pollutant].time.date).format('D')
    const yearNumber = moment(curr.pollutants[pollutant].time.date).format(
      'YYYY'
    )
    const monthNumber = moment(curr.pollutants[pollutant].time.date).format(
      'MMMM'
    )
    Object.assign(newpollutants, {
      [pollutant]: {
        exception: curr.pollutants[pollutant].exception,
        featureOfInterest: curr.pollutants[pollutant].featureOfInterest,
        time: {
          date: curr.pollutants[pollutant].time.date,
          hour: formatHour,
          day: dayNumber,
          month: monthNumber,
          year: yearNumber
        },
        value: polValue,
        daqi: getDaqi,
        band: getBand
      }
    })
  }
  return newpollutants
}

// Helper to build a single nearest location range entry
export function buildNearestLocationEntry(curr, latlon, lang) {
  // '' Convert coordinates if they're Irish Grid
  // '' MongoDB stores as [longitude, latitude] (GeoJSON), but convertIrishGridIfNeeded expects [latitude, longitude]
  const mongoLon = curr.location.coordinates[0]
  const mongoLat = curr.location.coordinates[1]
  const { lat, lon } = convertIrishGridIfNeeded(mongoLat, mongoLon)

  const getDistance =
    geolib.getDistance(
      { latitude: latlon?.lat, longitude: latlon?.lon },
      {
        latitude: lat,
        longitude: lon
      }
    ) * METERS_TO_MILES
  const newpollutants = buildPollutantsObject(curr, lang)
  if (Object.keys(newpollutants).length === 0) {
    const locationError = {
      locationId: curr.id,
      latlon
    }
    logger.error(
      `No valid pollutants found for location: ${JSON.stringify(locationError)}`,
      locationError
    )
    return null
  }
  return {
    area: curr.area,
    areaType: curr.areaType,
    location: {
      type: curr.location.type,
      coordinates: [lat, lon] // '' Store in app's [latitude, longitude] formats
    },
    id: curr.name?.replaceAll(' ', '') || '',
    name: curr.name,
    updated: curr.updated,
    distance: getDistance.toFixed(1),
    pollutants: { ...newpollutants }
  }
}

// Helper to build nearestLocationsRange for legacy measurements
export function buildNearestLocationsRange(
  matches,
  getMeasurments,
  latlon,
  lang
) {
  const measurementsCoordinates =
    matches.length > 0 ? coordinatesTotal(getMeasurments, latlon) : []
  const orderByDistanceMeasurements = geolib.orderByDistance(
    { latitude: latlon?.lat, longitude: latlon?.lon },
    measurementsCoordinates
  )
  const nearestMeasurementsPoints = orderByDistanceMeasurements.slice(
    0,
    NEARBY_LOCATIONS_COUNT
  )
  const pointsToDisplay = nearestMeasurementsPoints.filter((p) =>
    pointsInRange(latlon, p)
  )
  const nearestLocationsRangeCal = getMeasurments.filter((item) => {
    if (!item.location?.coordinates) {
      return false
    }
    // '' Convert coordinates if they're Irish Grid before comparison
    const coord1 = item.location.coordinates[0]
    const coord2 = item.location.coordinates[1]
    const { lat, lon } = convertIrishGridIfNeeded(coord1, coord2)

    return pointsToDisplay.some(
      (dis) => lat === dis.latitude && lon === dis.longitude
    )
  })
  const result = nearestLocationsRangeCal
    .map((curr) => buildNearestLocationEntry(curr, latlon, lang))
    .filter(Boolean)
  result.sort(
    (a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
  )
  return result
}

// Helper to process measurement pollutants with DAQI calculations
function processMeasurementPollutants(measurement, lang, latlon) {
  const updatedPollutants = {}

  for (const [pollutant, data] of Object.entries(
    measurement.pollutants || {}
  )) {
    const polValue = data?.value
    if (!isValidNonNegativeNumber(polValue)) {
      continue
    }

    const { getDaqi, getBand } =
      lang === LANG_CY
        ? getPollutantLevelCy(polValue, pollutant)
        : getPollutantLevel(polValue, pollutant)

    updatedPollutants[pollutant] = {
      ...data,
      daqi: getDaqi,
      band: getBand
    }
  }

  if (Object.keys(updatedPollutants).length === 0) {
    const measurementError = {
      measurementId: measurement.id,
      latlon
    }
    logger.error(
      `No valid pollutants found for measurement: ${JSON.stringify(measurementError)}`,
      measurementError
    )
  }

  return {
    ...measurement,
    pollutants: updatedPollutants
  }
}

// Helper to fetch and process Ricardo measurements
async function fetchAndProcessNewMeasurements(latlon, matches, lang, request) {
  if (!latlon?.lat || !latlon?.lon) {
    logger.warn('No latlon provided for measurements fetch')
    return []
  }

  logger.info(
    `[MEASUREMENTS DEBUG] Fetching measurements for lat: ${latlon.lat}, lon: ${latlon.lon}`
  )

  const newMeasurements = await fetchMeasurements(latlon.lat, latlon.lon, {
    request
  })

  logger.info(
    `[MEASUREMENTS DEBUG] Raw response from fetchMeasurements:`,
    JSON.stringify(newMeasurements, null, 2)
  )

  if (!newMeasurements) {
    logger.warn('[MEASUREMENTS DEBUG] newMeasurements is null/undefined')
    return []
  }

  if (Array.isArray(newMeasurements)) {
    logger.warn(
      '[MEASUREMENTS DEBUG] newMeasurements is an array (expected object with measurements property)'
    )
    logger.info(`[MEASUREMENTS DEBUG] Array length: ${newMeasurements.length}`)

    // If it's an array, treat it as the measurements array directly
    if (newMeasurements.length === 0) {
      logger.warn('[MEASUREMENTS DEBUG] Empty measurements array received')
      return []
    }

    const newMeasurementsMapped = newMeasurements.map((measurement) =>
      processMeasurementPollutants(measurement, lang, latlon)
    )

    return buildNearestLocationsRange(
      matches,
      newMeasurementsMapped,
      latlon,
      lang
    )
  }

  if (!newMeasurements?.measurements) {
    logger.warn(
      '[MEASUREMENTS DEBUG] newMeasurements.measurements is missing or empty'
    )
    logger.info(
      `[MEASUREMENTS DEBUG] newMeasurements structure:`,
      Object.keys(newMeasurements || {})
    )
    return []
  }

  logger.info(
    `[MEASUREMENTS DEBUG] Found ${newMeasurements.measurements.length} measurements`
  )

  const newMeasurementsMapped = newMeasurements.measurements.map(
    (measurement) => processMeasurementPollutants(measurement, lang, latlon)
  )

  return buildNearestLocationsRange(
    matches,
    newMeasurementsMapped,
    latlon,
    lang
  )
}

// '' Helper: prefer NI location coordinates for measurements
const getMeasurementLatLon = (location = {}, fallback = {}) => {
  const hasLocationCoords =
    location?.latitude != null && location?.longitude != null

  if (hasLocationCoords) {
    return { lat: location.latitude, lon: location.longitude }
  }

  return fallback
}

export async function getNearestLocation(
  matches,
  forecasts,
  location,
  index,
  lang,
  request
) {
  const { latlon, forecastCoordinates } = getLatLonAndForecastCoords(
    matches,
    location,
    index,
    forecasts
  )

  const measurementLatLon = getMeasurementLatLon(location, latlon)

  logger.info(
    `[MEASUREMENTS DEBUG] Using coordinates for measurements: lat=${measurementLatLon?.lat}, lon=${measurementLatLon?.lon}`
  )

  const forecastDay =
    moment
      .tz('Europe/London')
      ?.format('dddd')
      ?.substring(0, FORECAST_DAY_SLICE_LENGTH) || ''

  const nearestLocationsRange = await fetchAndProcessNewMeasurements(
    measurementLatLon,
    matches,
    lang,
    request
  )

  const nearestLocation =
    matches.length > 0
      ? getNearLocation(
          latlon?.lat,
          latlon?.lon,
          forecastCoordinates,
          forecasts
        )
      : {}

  const forecastNum = buildForecastNum(matches, nearestLocation, forecastDay)

  // '' Ensure nearestLocation is always an array for template compatibility
  const nearestLocationSafe = Array.isArray(nearestLocation)
    ? nearestLocation
    : []

  return {
    forecastNum,
    nearestLocationsRange,
    nearestLocation: nearestLocationSafe,
    latlon
  }
}
