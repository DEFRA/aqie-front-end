import { gazetteerEntryFilter } from '../../locations/helpers/gazetteer-util.js'
import { convertFirstLetterIntoUppercase } from '../../locations/helpers/convert-first-letter-into-upper-case.js'
import { transformKeys } from '../../locations/helpers/transform-summary-keys.js'
import { airQualityValues } from '../../locations/helpers/air-quality-values.js'
import {
  siteTypeDescriptions,
  pollutantTypes
} from '../../data/en/monitoring-sites.js'
import * as airQualityData from '../../data/en/air-quality.js'
import { LANG_CY } from '../../data/constants.js'

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
