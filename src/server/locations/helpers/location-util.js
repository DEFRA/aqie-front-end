import * as geolib from 'geolib'
import OsGridRef from 'mt-osgridref'
import { createLogger } from '../../common/helpers/logging/logger.js'
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
  // logger.info(`Fetching nearest location for latxx: ${lat}, lon: ${lon}`)
  // logger.info(
  //  `Fetching forecast coordinatesxx: ${JSON.stringify(forecastCoordinates)}`
  // )
  // logger.info(`Fetching forecastsxx: ${JSON.stringify(forecasts)}`)
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
  return Array.isArray(nearestLocation) ? nearestLocation : []
}

function orderByDistance(lat, lon, forecastCoordinates) {
  const getLocation = geolib.orderByDistance(
    { latitude: lat, longitude: lon },
    forecastCoordinates
  )
  return getLocation
}

function convertPointToLonLat(matches, location, index = 0) {
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
      // '' NI API returns xCoordinate/yCoordinate as Lat/Long (already converted)
      // Only easting/northing need Irish Grid → Lat/Long conversion
      if (matches[index].xCoordinate && matches[index].yCoordinate) {
        // xCoordinate is longitude, yCoordinate is latitude (already in WGS84)
        lon = matches[index].xCoordinate
        lat = matches[index].yCoordinate
      } else if (matches[index].GAZETTEER_ENTRY?.LONGITUDE && matches[index].GAZETTEER_ENTRY?.LATITUDE) {
        lon = matches[index].GAZETTEER_ENTRY.LONGITUDE
        lat = matches[index].GAZETTEER_ENTRY.LATITUDE
      } else if (matches[index].easting && matches[index].northing) {
        // Convert Irish Grid (easting/northing) to Lat/Long
        try {
          pointNI = new OsGridRef(matches[index].easting, matches[index].northing)
          const latlon = OsGridRef.osGridToLatLong(pointNI)
          lat = latlon._lat
          lon = latlon._lon
        } catch (error) {
          logger.error(
            `Failed to convert Irish Grid to Lat/Long: ${JSON.stringify(error)}`
          )
        }
      }
    }
  }
  return { lat, lon }
}

function coordinatesTotal(matches, _location) {
  let coordinates = []
  try {
    coordinates = matches.reduce((acc, current) => {
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
