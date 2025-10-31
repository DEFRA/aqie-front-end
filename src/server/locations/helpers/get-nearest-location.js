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
  MINUS_NINETY_NINE,
  NEARBY_LOCATIONS_COUNT
} from '../../data/constants.js'
import { fetchMeasurements } from './fetch-data.js'

// Helper to get latlon and forecastCoordinates //
function getLatLonAndForecastCoords(matches, location, index, forecasts) {
  const latlon =
    matches.length !== 0 ? convertPointToLonLat(matches, location, index) : {}
  const forecastCoordinates =
    matches.length !== 0 ? coordinatesTotal(forecasts, location) : []
  return { latlon, forecastCoordinates }
}

// Helper to build forecastNum
function buildForecastNum(matches, nearestLocation, forecastDay) {
  return matches.length !== 0
    ? nearestLocation.map((current) => {
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
    : 0
}

// Helper to build pollutants object for a measurement
function buildPollutantsObject(curr, lang) {
  const newpollutants = []
  Object.keys(curr.pollutants).forEach((pollutant) => {
    const polValue = curr.pollutants[pollutant].value
    if (
      polValue !== null &&
      polValue !== MINUS_NINETY_NINE &&
      polValue !== '0'
    ) {
      const { getDaqi, getBand } =
        lang === LANG_CY
          ? getPollutantLevelCy(polValue, pollutant)
          : getPollutantLevel(polValue, pollutant)
      const formatHour = moment(curr.pollutants[pollutant].time.date).format(
        'ha'
      )
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
  })
  return newpollutants
}

// Helper to build a single nearest location range entry
function buildNearestLocationEntry(curr, latlon, lang) {
  const getDistance =
    geolib.getDistance(
      { latitude: latlon?.lat, longitude: latlon?.lon },
      {
        latitude: curr.location.coordinates[0],
        longitude: curr.location.coordinates[1]
      }
    ) * 0.000621371192
  const newpollutants = buildPollutantsObject(curr, lang)
  if (Object.keys(newpollutants).length === 0) {
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
function buildNearestLocationsRange(matches, getMeasurments, latlon, lang) {
  const measurementsCoordinates =
    matches.length !== 0 ? coordinatesTotal(getMeasurments, latlon) : []
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
  result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
  return result
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
  let nearestLocationsRange = []
  let nearestLocation = {}
  let forecastNum = 0
  const resultLatlon = latlon
  let getMeasurments = null
  const forecastDay =
    moment
      .tz('Europe/London')
      ?.format('dddd')
      ?.substring(0, FORECAST_DAY_SLICE_LENGTH) || ''

  if (!useNewRicardoMeasurementsEnabled) {
    getMeasurments = await fetchMeasurements(
      latlon.lat,
      latlon.lon,
      useNewRicardoMeasurementsEnabled,
      { request }
    )
    nearestLocationsRange = buildNearestLocationsRange(
      matches,
      getMeasurments,
      latlon,
      lang
    )
  } else {
    let newMeasurements = []
    if (latlon?.lat && latlon?.lon) {
      newMeasurements = await fetchMeasurements(
        latlon.lat,
        latlon.lon,
        useNewRicardoMeasurementsEnabled,
        { request }
      )
    }

    if (newMeasurements?.measurements) {
      const newMeasurementsMapped = newMeasurements.measurements.map(
        (measurement) => {
          const updatedPollutants = {}

          Object.entries(measurement.pollutants || {}).forEach(
            ([pollutant, data]) => {
              const polValue = data?.value
              if (
                polValue !== null &&
                polValue !== MINUS_NINETY_NINE &&
                polValue !== '0'
              ) {
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
            }
          )

          return {
            ...measurement,
            pollutants: updatedPollutants
          }
        }
      )
      nearestLocationsRange = buildNearestLocationsRange(
        matches,
        newMeasurementsMapped,
        latlon,
        lang
      )
    }
  }
  nearestLocation =
    matches.length !== 0
      ? getNearLocation(
          latlon?.lat,
          latlon?.lon,
          forecastCoordinates,
          forecasts
        )
      : {}
  forecastNum = buildForecastNum(matches, nearestLocation, forecastDay)

  return {
    forecastNum,
    nearestLocationsRange,
    nearestLocation,
    latlon: resultLatlon
  }
}

export { getNearestLocation }
