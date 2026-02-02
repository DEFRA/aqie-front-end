import * as geolib from 'geolib'
import OsGridRef from 'mt-osgridref'
import proj4 from 'proj4'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

// '' Define Irish Grid (EPSG:29903) projection for NI coordinate conversion - from epsg.io
const irishGrid =
  '+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +units=m +no_defs +type=crs'
const wgs84 = 'EPSG:4326'

/**
 * '' Detect if coordinates are Irish Grid and convert to WGS84 if needed
 * Irish Grid coordinates are typically:
 * - Easting: 10,000 to 400,000 meters
 * - Northing: 10,000 to 500,000 meters
 * WGS84 for Ireland/UK:
 * - Latitude: 49 to 61 degrees
 * - Longitude: -11 to 2 degrees
 *
 * '' NOTE: This app uses [latitude, longitude] format (not GeoJSON standard)
 */
function convertIrishGridIfNeeded(coord1, coord2) {
  // '' Check if coordinates are clearly Irish Grid (both > 10000, indicating meters not degrees)
  // '' Irish Grid values for NI are typically: easting 10,000-400,000, northing 10,000-500,000
  // '' WGS84 values are always < 180 (degrees)
  if (coord1 > 10000 && coord1 < 500000 && coord2 > 10000 && coord2 < 600000) {
    try {
      logger.info(
        `[IRISH GRID DETECTION] Converting Irish Grid coordinates: [${coord1}, ${coord2}]`
      )
      const [lon, lat] = proj4(irishGrid, wgs84, [coord1, coord2])
      logger.info(
        `[IRISH GRID DETECTION] Converted to WGS84: lat=${lat}, lon=${lon}`
      )
      // '' Return in app's [latitude, longitude] format
      return { lat, lon, converted: true }
    } catch (error) {
      logger.error(
        `[IRISH GRID DETECTION] Failed to convert coordinates [${coord1}, ${coord2}]: ${error.message}`
      )
      // '' Fallback: treat as [lat, lon] (app format)
      return { lat: coord1, lon: coord2, converted: false }
    }
  }

  // '' Default: treat as app's [latitude, longitude] format (not GeoJSON)
  return { lat: coord1, lon: coord2, converted: false }
}

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
    // '' Convert coordinates if they're Irish Grid
    const coord1 = item.location.coordinates[0]
    const coord2 = item.location.coordinates[1]
    const { lat, lon } = convertIrishGridIfNeeded(coord1, coord2)

    return lat === getLocation.latitude && lon === getLocation.longitude
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
      // '' NI locations: Handle different coordinate formats
      // '' Priority: 1) xCoordinate/yCoordinate (WGS84), 2) LONGITUDE/LATITUDE, 3) easting/northing (Irish Grid)
      if (matches[index].xCoordinate && matches[index].yCoordinate) {
        // '' xCoordinate is longitude, yCoordinate is latitude (already in WGS84)
        lon = matches[index].xCoordinate
        lat = matches[index].yCoordinate
      } else if (
        matches[index].GAZETTEER_ENTRY?.LONGITUDE &&
        matches[index].GAZETTEER_ENTRY?.LATITUDE
      ) {
        lon = matches[index].GAZETTEER_ENTRY.LONGITUDE
        lat = matches[index].GAZETTEER_ENTRY.LATITUDE
      } else if (matches[index].easting && matches[index].northing) {
        // '' Convert Irish Grid (EPSG:29903) to WGS84 using proj4
        try {
          const [longitude, latitude] = proj4(irishGrid, wgs84, [
            matches[index].easting,
            matches[index].northing
          ])
          lat = latitude
          lon = longitude
        } catch (error) {
          logger.error(
            `Failed to convert Irish Grid to WGS84: ${JSON.stringify(error)}`
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
      // '' MongoDB GeoJSON format is [longitude, latitude]
      // '' But coordinates might be Irish Grid [easting, northing] - detect and convert
      const coord1 = current.location.coordinates[0]
      const coord2 = current.location.coordinates[1]
      const { lat, lon } = convertIrishGridIfNeeded(coord1, coord2)

      return [
        ...acc,
        {
          latitude: lat,
          longitude: lon
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
