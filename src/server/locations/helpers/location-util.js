/* eslint-disable prettier/prettier */
import * as geolib from 'geolib'
import OsGridRef from 'mt-osgridref'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
const logger = createLogger()

function pointsInRange(point1, point2) {
  const isPoint = geolib.isPointWithinRadius(
    { latitude: point1.lat, longitude: point1.lon },
    { latitude: point2.latitude, longitude: point2.longitude },
    100000
  )
  return isPoint
}

function getNearLocation(lat, lon, forecastCoordinates, forecasts) {
  let getLocation
  try {
    if (lat && lon && forecastCoordinates) {
      getLocation = geolib.findNearest(
        { latitude: lat.toString().trim(), longitude: lon.toString().trim() },
        forecastCoordinates
      )
    }
  } catch (error) {
    logger.error(
      `Failed to fetch getNearLocation: ${JSON.stringify(error.message)}`
    )
  }
  if (!getLocation || !getLocation.latitude || !getLocation.longitude) {
    logger.error('getLocation is undefined or missing properties')
    return []
  }
  const nearestLocation = forecasts?.filter((item) => {
    return (
      item.location.coordinates[0] === getLocation.latitude &&
      item.location.coordinates[1] === getLocation.longitude
    )
  })
  return nearestLocation
}

function orderByDistance(lat, lon, forecastCoordinates) {
  const getLocation = geolib.orderByDistance(
    { latitude: lat, longitude: lon },
    forecastCoordinates
  )
  return getLocation
}

function convertPointToLonLat(matches, location, index) {
  let lat = ''
  let lon = ''
  let point
  let pointNI
  if (matches || matches[index]) {
    if (location === 'uk-location') {
      point = new OsGridRef(
        matches[index].GAZETTEER_ENTRY?.GEOMETRY_X,
        matches[index].GAZETTEER_ENTRY?.GEOMETRY_Y
      )
      const latlon = OsGridRef.osGridToLatLong(point)
      lat = latlon._lat
      lon = latlon._lon
    } else {
      logger.info(
        `::::::::::: getNIPlaces 1  matches stringify NI ::::::::::: ${JSON.stringify(matches)}`
      )
      const long =
        matches[index].xCoordinate || matches[index].GAZETTEER_ENTRY.LONGITUDE
      const lati =
        matches[index].yCoordinate || matches[index].GAZETTEER_ENTRY.LATITUDE
      logger.info(`::::::::::: getNIPlaces 1  long NI ::::::::::: ${long}`)
      logger.info(`::::::::::: getNIPlaces 1  lati NI ::::::::::: ${lati}`)
      try {
        pointNI = new OsGridRef(long, lati)
      } catch (error) {
        logger.error(
          `Failed to fetch convertPointToLonLat matches
        .reduce: ${JSON.stringify(error)}`
        )
      }
      const latlon = OsGridRef.osGridToLatLong(pointNI)
      lat = latlon._lat
      lon = latlon._lon
    }
  }
  return { lat, lon }
}

function coordinatesTotal(matches, location) {
  let coordinates = []
  logger.info(
    `::::::::::: getNIPlaces 1  matches stringify NI ::::::::::: ${JSON.stringify(matches)}`
  )
  try {
    coordinates = matches.reduce((acc, current, index) => {
      return [
        ...acc,
        {
          latitude: current.location.coordinates[0],
          longitude: current.location.coordinates[1]
        }
      ]
    }, [])
  } catch (error) {
    logger.error(
      `Failed to fetch coordinatesTotal matches
    .reduce: ${JSON.stringify(error)}`
    )
  }
  return coordinates
}

export {
  pointsInRange,
  getNearLocation,
  orderByDistance,
  convertPointToLonLat,
  coordinatesTotal
}
