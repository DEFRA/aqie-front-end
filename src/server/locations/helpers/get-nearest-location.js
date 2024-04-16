/* eslint-disable prettier/prettier */
import * as geolib from 'geolib'
import moment from 'moment'
import {
  getNearLocation,
  convertPointToLonLat,
  coordinatesTotal,
  pointsInRange
} from '~/src/server/locations/helpers/location-util.js'

function getNearestLocation(matches, forecasts, measurements, location) {
  const latlon = convertPointToLonLat(matches, location)
  const forecastCoordinates = coordinatesTotal(forecasts)
  const measurementsCoordinates = coordinatesTotal(measurements)
  const nearestLocation = getNearLocation(
    latlon.lat,
    latlon.lon,
    forecastCoordinates,
    forecasts
  )

  const orderByDistanceMeasurements = geolib.orderByDistance(
    { latitude: latlon.lat, longitude: latlon.lon },
    measurementsCoordinates
  )
  const nearestMeasurementsPoints = orderByDistanceMeasurements.slice(0, 3)

  const pointsToDisplay = nearestMeasurementsPoints.filter((p) =>
    pointsInRange(latlon, p)
  )
  const nearestLocationsRange = measurements.filter((item, i) => {
    const opt = pointsToDisplay.some((dis, index) => {
      return (
        item.location.coordinates[0] === dis.latitude &&
        item.location.coordinates[1] === dis.longitude
      )
    })
    return opt
  })
  // TODO select and filter locations and pollutants which are null or have exceptions
  const forecastDay = moment().format('dddd').substring(0, 3)
  const forecastNum = nearestLocation.map((current) => {
    let val = ''
    current.forecast.forEach((item) => {
      if (item.day === forecastDay) val = item.value
    })
    return val
  })
  return { forecastNum, nearestLocationsRange }
}

export { getNearestLocation }
