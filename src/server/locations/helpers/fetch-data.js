/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { proxyFetch } from '~/src/helpers/proxy-fetch.js'
import { config } from '~/src/config'
const options = { method: 'GET', headers: { 'Content-Type': 'text/json' } }

async function fetchData(locationType, userLocation) {
  const symbolsArr = ['%', '$', '&', '#', '!', '¬', '`']
  let getOSPlaces = { data: [] }
  if (locationType === 'uk-location') {
    const filters = [
      'LOCAL_TYPE:City',
      'LOCAL_TYPE:Town',
      'LOCAL_TYPE:Village',
      'LOCAL_TYPE:Suburban_Area',
      'LOCAL_TYPE:Postcode',
      'LOCAL_TYPE:Airport'
    ].join('+')
    const osPlacesApiUrl = config.get('osPlacesApiUrl')
    const osPlacesApiKey = config.get('osPlacesApiKey')
    console.log(`userLocation 7 ${osPlacesApiKey}`)
    const osPlacesApiUrlFull = `${osPlacesApiUrl}${encodeURIComponent(
      userLocation
    )}&fq=${encodeURIComponent(filters)}&key=${osPlacesApiKey}`
    const forecastSummaryURL = config.get('forecastSummaryUrl')
    const forecastsAPIurl = config.get('forecastsApiUrl')
    const measurementsAPIurl = config.get('measurementsApiUrl')
    console.log(`userLocation 8 ${forecastSummaryURL}`)
    console.log(`userLocation 8 ${forecastsAPIurl}`)

    const forecastsRes = await fetch(`${forecastsAPIurl}`, options).catch(
      (err) => {
        console.log(`err 1 ${JSON.stringify(err.message)}`)
      }
    )
    let getForecasts
    if (forecastsRes.ok) {
      getForecasts = await forecastsRes.json()
    }
    console.log(`userLocation 9 ${getForecasts}`)
    const measurementsRes = await fetch(measurementsAPIurl, options).catch(
      (err) => {
        console.log(`err 2 ${JSON.stringify(err.message)}`)
      }
    )
    let getMeasurements
    if (measurementsRes.ok) {
      getMeasurements = await measurementsRes.json()
    }
    console.log(`userLocation 9 ${getMeasurements}`)
    console.log(`userLocation 9 ${JSON.stringify(measurementsAPIurl)}`)

    const forecastSummaryRes = await proxyFetch(
      forecastSummaryURL,
      options
    ).catch((err) => {
      console.log(`err 3 ${JSON.stringify(err.message)}`)
    })
    let getDailySummary
    if (forecastSummaryRes.ok) {
      getDailySummary = await forecastSummaryRes.json()
    }
    console.log(`userLocation 9 ${getDailySummary}`)
    const shouldCallApi = symbolsArr.some((symbol) =>
      userLocation.includes(symbol)
    )
    if (!shouldCallApi) {
      const osPlacesRes = await proxyFetch(osPlacesApiUrlFull, options).catch(
        (err) => {
          console.log(`err 4 ${JSON.stringify(err.message)}`)
        }
      )
      if (osPlacesRes.ok) {
        getOSPlaces = await osPlacesRes.json()
      }
    }
    console.log(`userLocation 9 ${getOSPlaces}`)
    return { getDailySummary, getForecasts, getMeasurements, getOSPlaces }
  } else if (locationType === 'ni-location') {
    let getNIPlaces
    const postcodeNIURL = config.get('postcodeNortherIrelandUrl')
    const postcodeNortherIrelandURL = `${postcodeNIURL}${encodeURIComponent(userLocation)}`
    const northerIrelandRes = await proxyFetch(
      postcodeNortherIrelandURL,
      options
    )
    if (northerIrelandRes.ok) {
      getNIPlaces = await northerIrelandRes.json()
    }
    return { getNIPlaces }
  }
}

export { fetchData }
