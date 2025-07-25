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
import { LANG_CY, FORECAST_DAY_SLICE_LENGTH } from '../../data/constants.js'

function getNearestLocation(
  matches,
  forecasts,
  measurements,
  location,
  index,
  lang
) {
  const latlon =
    matches.length !== 0 ? convertPointToLonLat(matches, location, index) : {}
  const forecastCoordinates =
    matches.length !== 0 ? coordinatesTotal(forecasts, location) : []
  const measurementsCoordinates =
    matches.length !== 0 ? coordinatesTotal(measurements, location) : []
  const nearestLocation =
    matches.length !== 0
      ? getNearLocation(
          latlon?.lat,
          latlon?.lon,
          forecastCoordinates,
          forecasts
        )
      : {}
  const orderByDistanceMeasurements = geolib.orderByDistance(
    { latitude: latlon?.lat, longitude: latlon?.lon },
    measurementsCoordinates
  )
  const nearestMeasurementsPoints = orderByDistanceMeasurements.slice(0, 3)
  const pointsToDisplay = nearestMeasurementsPoints.filter((p) =>
    pointsInRange(latlon, p)
  )
  const nearestLocationsRangeCal = measurements?.filter((item, i) => {
    if (!item.location?.coordinates) {
      return false
    }
    const opt = pointsToDisplay.some(
      (dis) =>
        item.location.coordinates[0] === dis.latitude &&
        item.location.coordinates[1] === dis.longitude
    )
    return opt
  })
  // TODO select and filter locations and pollutants which are not null or don't have exceptions
  const nearestLocationsRange = nearestLocationsRangeCal?.reduce(
    (acc, curr) => {
      const newpollutants = []
      const getDistance =
        geolib.getDistance(
          { latitude: latlon?.lat, longitude: latlon?.lon },
          {
            latitude: curr.location.coordinates[0],
            longitude: curr.location.coordinates[1]
          }
        ) * 0.000621371192
      Object.keys(curr.pollutants).forEach((pollutant) => {
        const polValue = curr.pollutants[pollutant].value
        if (polValue !== null && polValue !== -99 && polValue !== '0') {
          const { getDaqi, getBand } =
            lang === LANG_CY
              ? getPollutantLevelCy(polValue, pollutant)
              : getPollutantLevel(polValue, pollutant)
          const formatHour = moment(
            curr.pollutants[pollutant].time.date
          ).format('ha')
          const dayNumber = moment(curr.pollutants[pollutant].time.date).format(
            'D'
          )
          const yearNumber = moment(
            curr.pollutants[pollutant].time.date
          ).format('YYYY')
          const monthNumber = moment(
            curr.pollutants[pollutant].time.date
          ).format('MMMM')
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
          id: curr.name?.replaceAll(' ', '') || '',
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
  const forecastDay =
    moment
      .tz('Europe/London')
      ?.format('dddd')
      ?.substring(0, FORECAST_DAY_SLICE_LENGTH) || ''
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
