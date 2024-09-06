/* eslint-disable prettier/prettier */
import { proxyFetch } from '~/src/helpers/proxy-fetch.js'
import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import xml2js from 'xml2js'
const options = { method: 'GET', headers: { 'Content-Type': 'text/json' } }
const logger = createLogger()

async function fetchData(locationType, userLocation) {
  // Parse the XML
  const xml =
    "<xs:element name='note'><xs:complexType><xs:sequence><xs:element name='to' type='xs:string'/><xs:element name='from' type='xs:string'/><xs:element name='heading' type='xs:string'/><xs:element name='body' type='xs:string'/></xs:sequence></xs:complexType></xs:element>"
  xml2js.parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    // Access attributes
    const elements =
      result['xs:element']['xs:complexType'][0]['xs:sequence'][0]['xs:element']

    elements.forEach((element) => {
      const attributeValue = element.$.name
      logger.info(attributeValue)
    })
  })
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
    const osPlacesApiUrlFull = `${osPlacesApiUrl}${encodeURIComponent(
      userLocation
    )}&fq=${encodeURIComponent(filters)}&key=${osPlacesApiKey}`
    const forecastSummaryURL = config.get('forecastSummaryUrl')
    const forecastsAPIurl = config.get('forecastsApiUrl')
    const measurementsAPIurl = config.get('measurementsApiUrl')

    const newApiUrl =
      'https://dev-api-gateway.azure.defra.cloud/api/address-lookup/v2.0/addresses?postcode=CV34BF'
    const newApi = `&subscription-key=7b2f88485b3340fcae0684cea21c531b&maxresults=1`
    const newApiUrlFull = `${newApiUrl}${newApi}`
    let newApiData = {}
    logger.info(`::::::::: NEW API URL ::::::::::::: ${newApiUrlFull}`)
    const newApiRes = await proxyFetch(newApiUrlFull, options).catch((err) => {
      logger.info(
        `::::::::: NEW API ERROR  ::::::::::::: ${JSON.stringify(err.message)}`
      )
    })
    newApiData = await newApiRes.json()
    logger.info(
      `:::::::::  NEW API DATA  :::::::::::: ${JSON.stringify(newApiData)}`
    )

    const forecastsRes = await fetch(`${forecastsAPIurl}`, options).catch(
      (err) => {
        logger.info(`err ${JSON.stringify(err.message)}`)
      }
    )
    let getForecasts
    if (forecastsRes.ok) {
      getForecasts = await forecastsRes.json()
    }
    const measurementsRes = await fetch(measurementsAPIurl, options).catch(
      (err) => {
        logger.info(`err ${JSON.stringify(err.message)}`)
      }
    )
    let getMeasurements
    if (measurementsRes.ok) {
      getMeasurements = await measurementsRes.json()
    }

    const forecastSummaryRes = await proxyFetch(
      forecastSummaryURL,
      options
    ).catch((err) => {
      logger.info(`err ${JSON.stringify(err.message)}`)
    })
    let getDailySummary
    if (forecastSummaryRes.ok) {
      getDailySummary = await forecastSummaryRes.json()
    }
    const shouldCallApi = symbolsArr.some((symbol) =>
      userLocation.includes(symbol)
    )
    if (!shouldCallApi) {
      const osPlacesRes = await proxyFetch(osPlacesApiUrlFull, options).catch(
        (err) => {
          logger.info(`err ${JSON.stringify(err.message)}`)
        }
      )
      if (osPlacesRes.ok) {
        getOSPlaces = await osPlacesRes.json()
      }
    }
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
