import { gazetteerEntryFilter } from '~/src/server/locations/helpers/gazetteer-util'
import { convertFirstLetterIntoUppercase } from '~/src/server/locations/helpers/convert-first-letter-into-upper-case'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '~/src/server/locations/helpers/air-quality-values.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '~/src/server/data/en/monitoring-sites.js'
import * as airQualityData from '~/src/server/data/en/air-quality.js'
import { LANG_CY } from '~/src/server/data/constants'

const renderLocationDetailsView = (locationDetails, config, h) => {
  const {
    forecastNum,
    nearestLocationsRange,
    locationData,
    lang,
    metaSiteUrl,
    english,
    multipleLocations,
    daqi,
    calendarWelsh,
    getMonth
  } = config

  let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)
  const { transformedDailySummary } = transformKeys(
    locationData.dailySummary,
    lang
  )
  const { airQuality } = airQualityValues(forecastNum, lang)

  return h.view('locations/location', {
    result: locationDetails,
    airQuality,
    airQualityData: airQualityData.commonMessages,
    monitoringSites: nearestLocationsRange,
    siteTypeDescriptions,
    pollutantTypes,
    pageTitle: `${multipleLocations.titlePrefix} ${title} - ${multipleLocations.pageTitle}`,
    metaSiteUrl,
    description: `${daqi.description.a} ${headerTitle}${daqi.description.b}`,
    title: `${multipleLocations.titlePrefix} ${headerTitle}`,
    displayBacklink: true,
    transformedDailySummary,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    daqi,
    welshMonth: calendarWelsh[getMonth],
    summaryDate:
      lang === LANG_CY ? locationData.welshDate : locationData.englishDate,
    dailySummaryTexts: english.dailySummaryTexts,
    serviceName: multipleLocations.serviceName,
    lang
  })
}

export default renderLocationDetailsView
