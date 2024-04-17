/* eslint-disable prettier/prettier */
import * as geolib from 'geolib'
import OsGridRef from 'mt-osgridref'

function pointsInRange(point1, point2) {
  const isPoint = geolib.isPointWithinRadius(
    { latitude: point1.lat, longitude: point1.lon },
    { latitude: point2.latitude, longitude: point2.longitude },
    100000
  )
  return isPoint
}

function getNearLocation(lat, lon, forecastCoordinates, forecasts) {
  const getLocation = geolib.findNearest(
    { latitude: lat, longitude: lon },
    forecastCoordinates
  )
  const nearestLocation = forecasts.filter((item) => {
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
  if (location === 'uk-location') {
    point = new OsGridRef(
      matches[index].GAZETTEER_ENTRY.GEOMETRY_X,
      matches[index].GAZETTEER_ENTRY.GEOMETRY_Y
    )
    const latlon = OsGridRef.osGridToLatLong(point)
    lat = latlon._lat
    lon = latlon._lon
  } else {
    lat = matches[index].latitude
    lon = matches[index].longitude
  }
  return { lat, lon }
}

function coordinatesTotal(matches) {
  const coordinates = matches.reduce((acc, current, index) => {
    return [
      ...acc,
      {
        latitude: current.location.coordinates[0],
        longitude: current.location.coordinates[1]
      }
    ]
  }, [])
  return coordinates
}

export {
  pointsInRange,
  getNearLocation,
  orderByDistance,
  convertPointToLonLat,
  coordinatesTotal
}
