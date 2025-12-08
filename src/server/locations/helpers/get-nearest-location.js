import * as geolib from 'geolib'
import moment from 'moment-timezone'
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
  return matches.length > 0
    ? nearestLocation.map((current) => {
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
    : 0
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
  const getDistance =
    geolib.getDistance(
      { latitude: latlon?.lat, longitude: latlon?.lon },
      {
        latitude: curr.location.coordinates[0],
        longitude: curr.location.coordinates[1]
      }
    ) * METERS_TO_MILES
  const newpollutants = buildPollutantsObject(curr, lang)
  if (Object.keys(newpollutants).length === 0) {
    logger.error(`No valid pollutants found for location`, {
      locationId: curr.id,
      latlon
    })
    return null
  }
  return {
    area: curr.area,
    areaType: curr.areaType,
    location: {
      type: curr.location.type,
      coordinates: [curr.location.coordinates[0], curr.location.coordinates[1]]
    },
    id: curr.name?.replaceAll(' ', '') || '',
    name: curr.name,
    updated: curr.updated,
    distance: getDistance.toFixed(1),
    pollutants: { ...newpollutants }
  }
}

// Helper to build nearestLocationsRange for !useNewRicardoMeasurementsEnabled
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
    return pointsToDisplay.some(
      (dis) =>
        item.location.coordinates[0] === dis.latitude &&
        item.location.coordinates[1] === dis.longitude
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
    logger.error(`No valid pollutants found for measurement`, {
      measurementId: measurement.id,
      latlon
    })
  }

  return {
    ...measurement,
    pollutants: updatedPollutants
  }
}

// Helper to fetch and process new Ricardo measurements
async function fetchAndProcessNewMeasurements(
  latlon,
  matches,
  lang,
  useNewRicardoMeasurementsEnabled,
  request
) {
  if (!latlon?.lat || !latlon?.lon) {
    return []
  }

  const newMeasurements = await fetchMeasurements(
    latlon.lat,
    latlon.lon,
    useNewRicardoMeasurementsEnabled,
    { request }
  )

  if (!newMeasurements?.measurements) {
    return []
  }

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

// Helper to fetch and process legacy measurements
async function fetchAndProcessLegacyMeasurements(
  latlon,
  matches,
  lang,
  useNewRicardoMeasurementsEnabled,
  request
) {
  const measurements = await fetchMeasurements(
    latlon.lat,
    latlon.lon,
    useNewRicardoMeasurementsEnabled,
    { request }
  )

  return buildNearestLocationsRange(matches, measurements, latlon, lang)
}

async function getNearestLocation(
  matches,
  forecasts,
  location,
  index,
  lang,
  useNewRicardoMeasurementsEnabled,
  request
) {
  const { latlon, forecastCoordinates } = getLatLonAndForecastCoords(
    matches,
    location,
    index,
    forecasts
  )

  const forecastDay =
    moment
      .tz('Europe/London')
      ?.format('dddd')
      ?.substring(0, FORECAST_DAY_SLICE_LENGTH) || ''

  const nearestLocationsRange = useNewRicardoMeasurementsEnabled
    ? await fetchAndProcessNewMeasurements(
        latlon,
        matches,
        lang,
        useNewRicardoMeasurementsEnabled,
        request
      )
    : await fetchAndProcessLegacyMeasurements(
        latlon,
        matches,
        lang,
        useNewRicardoMeasurementsEnabled,
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

  return {
    forecastNum,
    nearestLocationsRange,
    nearestLocation,
    latlon
  }
}

export { getNearestLocation }
