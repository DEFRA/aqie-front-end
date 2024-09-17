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
  logger.info(`::::::::::::: itemlat ::::::::::: ${lat}`)
  logger.info(`::::::::::::: itemlon ::::::::::: ${lon}`)
  logger.info(
    `::::::::::::: forecastCoordinates ::::::::::: ${forecastCoordinates}`
  )
  try {
    getLocation = geolib.findNearest(
      { latitude: lat, longitude: lon },
      forecastCoordinates
    )
  } catch (error) {
    logger.error(
      `Failed to fetch getNearLocation: ${JSON.stringify(error.message)}`
    )
  }
  if (!getLocation || !getLocation.latitude || !getLocation.longitude) {
    logger.error('getLocation is undefined or missing properties')
    return []
  }
  logger.info(
    `::::::::::::: getLocation.latitude ::::::::::: ${getLocation.latitude}`
  )
  logger.info(
    `::::::::::::: getLocation.longitude ::::::::::: ${getLocation.longitude}`
  )
  const nearestLocation = forecasts
    .filter((item) => {
      logger.info(`::::::::::::: item ::::::::::: ${item}`)
      logger.info(`::::::::::::: getLocation ::::::::::: ${getLocation}`)
      return (
        item.location.coordinates[0] === getLocation.latitude &&
        item.location.coordinates[1] === getLocation.longitude
      )
    })
    .cath((err) => {
      logger.error(
        `Failed to fetch getNearLocation: ${JSON.stringify(err.message)}`
      )
    })
  return nearestLocation
}

function orderByDistance(lat, lon, forecastCoordinates) {
  const getLocation = geolib.orderByDistance(
    { latitude: lat, longitude: lon },
    forecastCoordinates
  )
  logger.info(`::::::::::::: getLocation ::::::::::: ${getLocation}`)
  return getLocation
}

function convertPointToLonLat(matches, location, index) {
  let lat = ''
  let lon = ''
  let point
  let pointNI
  logger.info(
    `::::::::::::: convertPointToLonLat matches 1 ::::::::::: ${JSON.stringify(matches)}`
  )
  if (location === 'uk-location') {
    point = new OsGridRef(
      matches[index].GAZETTEER_ENTRY.GEOMETRY_X,
      matches[index].GAZETTEER_ENTRY.GEOMETRY_Y
    )
    const latlon = OsGridRef.osGridToLatLong(point)
    lat = latlon._lat
    lon = latlon._lon
  } else {
    logger.info(
      `::::::::::::: convertPointToLonLat matches 2 ::::::::::: ${JSON.stringify(matches)}`
    )
    try {
      pointNI = new OsGridRef(
        matches[index].xCoordinate,
        matches[index].yCoordinate
      )
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
  logger.info(`::::::::::::: lat ::::::::::: ${lat}`)
  logger.info(`::::::::::::: lon ::::::::::: ${lon}`)
  return { lat, lon }
}

function coordinatesTotal(matches, location) {
  logger.info(
    `::::::::::::: coordinatesTotal matches  ::::::::::: ${JSON.stringify(matches)}`
  )
  let coordinates = []
  try {
    coordinates = matches.reduce((acc, current, index) => {
      if (location === 'uk-location') {
        return [
          ...acc,
          {
            latitude: current.location.coordinates[0],
            longitude: current.location.coordinates[1]
          }
        ]
      }

      return [
        ...acc,
        {
          latitude: current.xCoordinate,
          longitude: current.yCoordinate
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
