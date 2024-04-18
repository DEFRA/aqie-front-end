/* eslint-disable prettier/prettier */
import * as geolib from 'geolib'
import moment from 'moment'
import {
  getNearLocation,
  convertPointToLonLat,
  coordinatesTotal,
  pointsInRange
} from '~/src/server/locations/helpers/location-util.js'
import { getPollutantLevel } from './pollutant-level-calculation'

const newpollutants = []
function getNearestLocation(matches, forecasts, measurements, location, index) {
  const latlon = convertPointToLonLat(matches, location, index)
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
  let nearestLocationsRange = measurements.filter((item, i) => {
    const opt = pointsToDisplay.some((dis, index) => {
      return (
        item.location.coordinates[0] === dis.latitude &&
        item.location.coordinates[1] === dis.longitude
      )
    })
    return opt
  })
  // TODO select and filter locations and pollutants which are not null or don't have exceptions
  nearestLocationsRange = nearestLocationsRange.reduce((acc, curr) => {
    const getDistance =
      geolib.getDistance(
        { latitude: latlon.lat, longitude: latlon.lon },
        {
          latitude: curr.location.coordinates[0],
          longitude: curr.location.coordinates[1]
        }
      ) * 0.000621371192
    Object.keys(curr.pollutants).forEach((pollutant) => {
      const polValue = curr.pollutants[pollutant].value
      if (polValue !== null && polValue !== -99) {
        const { getDaqi, getBand } = getPollutantLevel(polValue, pollutant)
        Object.assign(newpollutants, {
          [pollutant]: {
            exception: curr.pollutants[pollutant].exception,
            featureOfInterest: curr.pollutants[pollutant].featureOfInterest,
            time: { date: curr.pollutants[pollutant].time.date },
            value: polValue,
            daqi: getDaqi,
            band: getBand
          }
        })
      }
    })

    return [
      {
        ...acc,
        area: curr.area,
        areaType: curr.areaType,
        location: {
          type: curr.location.type,
          coordinates: [
            curr.location.coordinates[0],
            curr.location.coordinates[1]
          ]
        },
        name: curr.name,
        updated: curr.updated,
        distance: getDistance.toFixed(1),
        pollutants: { ...newpollutants }
      }
    ]
  }, [])

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
