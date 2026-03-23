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

const hasMatches = (matches) => matches.length > 0

// Helper to get latlon and forecastCoordinates //
export function getLatLonAndForecastCoords(
  matches,
  location,
  index,
  forecasts
) {
  const latlon = hasMatches(matches)
    ? convertPointToLonLat(matches, location, index)
    : {}
  const forecastCoordinates = hasMatches(matches)
    ? coordinatesTotal(forecasts, location)
    : []
  return { latlon, forecastCoordinates }
}

// Helper to build forecastNum
export function buildForecastNum(matches, nearestLocation, forecastDay) {
  if (!hasMatches(matches)) {
    return 0
  }

  return nearestLocation.map((current) => {
    let todayDate = []
    const otherdays = []
    current.forecast.forEach(({ day, value }) => {
      if (day === forecastDay) {
        todayDate = [{ today: value }]
      } else {
        otherdays.push({ [day]: value })
      }
    })
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
  Object.keys(curr.pollutants).forEach((pollutant) => {
    const polValue = curr.pollutants[pollutant].value
    // Only proceed if the value is a valid non‑negative number
    if (!isValidNonNegativeNumber(polValue)) {
      return
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
  })
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
  const measurementsCoordinates = hasMatches(matches)
    ? coordinatesTotal(getMeasurments, latlon)
    : []
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

const buildUpdatedPollutantsForMeasurement = (measurement, lang) => {
  const updatedPollutants = {}

  Object.entries(measurement.pollutants || {}).forEach(([pollutant, data]) => {
    const polValue = data?.value
    // Only proceed if the value is a valid non‑negative number
    if (!isValidNonNegativeNumber(polValue)) {
      return
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
  })

  return updatedPollutants
}

const mapMeasurementWithPollutants = (measurement, lang, latlon) => {
  const updatedPollutants = buildUpdatedPollutantsForMeasurement(
    measurement,
    lang
  )

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

const mapNewMeasurementsWithPollutants = (measurements = [], lang, latlon) => {
  return measurements.map((measurement) =>
    mapMeasurementWithPollutants(measurement, lang, latlon)
  )
}

const getForecastDay = () => {
  return (
    moment
      .tz('Europe/London')
      ?.format('dddd')
      ?.substring(0, FORECAST_DAY_SLICE_LENGTH) || ''
  )
}

const getNearestLocationFromForecasts = (
  matches,
  latlon,
  forecastCoordinates,
  forecasts
) => {
  if (!hasMatches(matches)) {
    return {}
  }

  return getNearLocation(latlon?.lat, latlon?.lon, forecastCoordinates, forecasts)
}

const fetchLegacyNearestLocationsRange = async (matches, latlon, lang, request) => {
  const measurements = await fetchMeasurements(latlon.lat, latlon.lon, {
    request
  })

  return buildNearestLocationsRange(matches, measurements, latlon, lang)
}

const fetchNewNearestLocationsRange = async (matches, latlon, lang, request) => {
  if (!(latlon?.lat && latlon?.lon)) {
    return []
  }

  const newMeasurements = await fetchMeasurements(latlon.lat, latlon.lon, {
    request
  })

  if (!newMeasurements?.measurements) {
    return []
  }

  const newMeasurementsMapped = mapNewMeasurementsWithPollutants(
    newMeasurements.measurements,
    lang,
    latlon
  )

  return buildNearestLocationsRange(matches, newMeasurementsMapped, latlon, lang)
}

const resolveNearestLocationsRange = async ({
  matches,
  latlon,
  lang,
  useNewRicardoMeasurementsEnabled,
  skipMeasurements,
  request
}) => {
  if (skipMeasurements) {
    return []
  }

  if (useNewRicardoMeasurementsEnabled) {
    return fetchNewNearestLocationsRange(matches, latlon, lang, request)
  }

  return fetchLegacyNearestLocationsRange(matches, latlon, lang, request)
}

async function getNearestLocation(
  matches,
  forecasts,
  location,
  index,
  lang,
  useNewRicardoMeasurementsEnabled,
  context = {}
) {
  const request = context?.request
  const skipMeasurements = Boolean(context?.skipMeasurements)
  const { latlon, forecastCoordinates } = getLatLonAndForecastCoords(
    matches,
    location,
    index,
    forecasts
  )
  const forecastDay = getForecastDay()

  const nearestLocationsRange = await resolveNearestLocationsRange({
    matches,
    latlon,
    lang,
    useNewRicardoMeasurementsEnabled,
    skipMeasurements,
    request
  })

  const nearestLocation = getNearestLocationFromForecasts(
    matches,
    latlon,
    forecastCoordinates,
    forecasts
  )

  const forecastNum = buildForecastNum(matches, nearestLocation, forecastDay)

  return {
    forecastNum,
    nearestLocationsRange,
    nearestLocation,
    latlon
  }
}

export { getNearestLocation }
