/* eslint-disable prettier/prettier */
import * as geolib from 'geolib'
import moment from 'moment-timezone'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import {
  getNearLocation,
  convertPointToLonLat,
  coordinatesTotal,
  pointsInRange
} from '~/src/server/locations/helpers/location-util.js'
import { getPollutantLevel } from '~/src/server/locations/helpers/pollutant-level-calculation'
import { getPollutantLevelCy } from '~/src/server/locations/helpers/cy/pollutant-level-calculation'
const logger = createLogger()

function getNearestLocation(
  matches,
  forecasts,
  measurements,
  location,
  index,
  lang
) {
  logger.info(`:::: the beginning lang  :::::::: ${lang}`)
  const latlon =
    matches.length !== 0 ? convertPointToLonLat(matches, location, index) : {}
  logger.info(`:::: matches  :::::::: ${JSON.stringify(matches)}`)
  const forecastCoordinates =
    matches.length !== 0 ? coordinatesTotal(forecasts, location) : []
  logger.info(`:::: forecasts  ::::::::`)
  const measurementsCoordinates =
    matches.length !== 0 ? coordinatesTotal(measurements, location) : []
  logger.info(`:::: measurements  ::::::::`)
  const nearestLocation =
    matches.length !== 0
      ? getNearLocation(latlon.lat, latlon.lon, forecastCoordinates, forecasts)
      : {}
  logger.info(`:::: location1 ::::::::`)
  const orderByDistanceMeasurements = geolib.orderByDistance(
    { latitude: latlon.lat, longitude: latlon.lon },
    measurementsCoordinates
  )
  logger.info(`:::: location2  ::::::::`)
  const nearestMeasurementsPoints = orderByDistanceMeasurements.slice(0, 3)
  logger.info(`:::: location3  ::::::::`)
  const pointsToDisplay = nearestMeasurementsPoints.filter((p) =>
    pointsInRange(latlon, p)
  )
  logger.info(`:::::::::::::::;;  pointsToDisplay ::::::::::::::::::`)
  const nearestLocationsRangeCal = measurements.filter((item, i) => {
    const opt = pointsToDisplay.some((dis, index) => {
      return (
        item.location.coordinates[0] === dis.latitude &&
        item.location.coordinates[1] === dis.longitude
      )
    })
    logger.info(`:::: nearestLocationsRangeCal 1  ::::::::`)
    return opt
  })
  logger.info(
    `:::::::::::::::;;  nearestLocationsRangeCal 2 :::::::::::::::::: ${nearestLocationsRangeCal}`
  )
  // TODO select and filter locations and pollutants which are not null or don't have exceptions
  const nearestLocationsRange = nearestLocationsRangeCal.reduce(
    (acc, curr, index) => {
      const newpollutants = []
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
        if (polValue !== null && polValue !== -99 && polValue !== '0') {
          const { getDaqi, getBand } =
            lang === 'cy'
              ? getPollutantLevelCy(polValue, pollutant)
              : getPollutantLevel(polValue, pollutant)
          const formatDate = moment(
            curr.pollutants[pollutant].time.date
          ).format('ha')
          Object.assign(newpollutants, {
            [pollutant]: {
              exception: curr.pollutants[pollutant].exception,
              featureOfInterest: curr.pollutants[pollutant].featureOfInterest,
              time: { date: formatDate },
              value: polValue,
              daqi: getDaqi,
              band: getBand
            }
          })
        }
      })
      if (Object.keys(newpollutants).length !== 0) {
        acc.push({
          area: curr.area,
          areaType: curr.areaType,
          location: {
            type: curr.location.type,
            coordinates: [
              curr.location.coordinates[0],
              curr.location.coordinates[1]
            ]
          },
          id: curr.name.replaceAll(' ', ''),
          name: curr.name,
          updated: curr.updated,
          distance: getDistance.toFixed(1),
          pollutants: { ...newpollutants }
        })
      }
      acc.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      return acc
    },
    []
  )

  const forecastDay = moment.tz('Europe/London').format('dddd').substring(0, 3)
  const forecastNum =
    matches.length !== 0
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
  return { forecastNum, nearestLocationsRange, latlon }
}

export { getNearestLocation }
