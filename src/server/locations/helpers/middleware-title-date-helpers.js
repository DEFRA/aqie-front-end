import moment from 'moment-timezone'
import { convertFirstLetterIntoUppercase } from './convert-first-letter-into-upper-case.js'
import { english } from '../../data/en/en.js'
import {
  convertStringToHyphenatedLowercaseWords,
  extractAndFormatUKPostcode,
  splitAndKeepFirstWord,
  isValidFullPostcodeUK,
  formatUKPostcode
} from './convert-string.js'

const getTitleAndHeaderTitle = (
  locationDetails,
  locationNameOrPostcode = 'Unknown Location'
) => {
  const { home } = english
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''

  if (locationDetails?.[0]) {
    const gazetteerEntry = locationDetails[0].GAZETTEER_ENTRY

    if (gazetteerEntry?.DISTRICT_BOROUGH) {
      ;({ title, headerTitle, urlRoute, term1 } = handleDistrictBorough(
        gazetteerEntry,
        home
      ))
    } else if (gazetteerEntry?.COUNTY_UNITARY) {
      ;({ title, headerTitle, urlRoute, term1 } = handleCountyUnitary(
        gazetteerEntry,
        locationNameOrPostcode,
        home
      ))
    } else {
      title = locationNameOrPostcode
      headerTitle = locationNameOrPostcode
      urlRoute = convertStringToHyphenatedLowercaseWords(locationNameOrPostcode)
      term1 = locationNameOrPostcode
    }
  }

  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)
  urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)

  const postcodeCheck = term1
  const postcode = extractAndFormatUKPostcode(postcodeCheck)
  urlRoute = postcode
    ? splitAndKeepFirstWord(urlRoute)
    : convertStringToHyphenatedLowercaseWords(urlRoute)

  return { title, headerTitle, urlRoute }
}

const handleDistrictBorough = (gazetteerEntry, home) => {
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''

  if (gazetteerEntry.NAME2) {
    title = `${gazetteerEntry.NAME2}, ${gazetteerEntry.DISTRICT_BOROUGH} - ${home.pageTitle}`
    headerTitle = `${gazetteerEntry.NAME2}, ${gazetteerEntry.DISTRICT_BOROUGH}`
    urlRoute = `${gazetteerEntry.NAME2}_${gazetteerEntry.DISTRICT_BOROUGH}`
    term1 = gazetteerEntry.NAME2
  } else {
    term1 = gazetteerEntry.NAME1
    const isFullPostcode = isValidFullPostcodeUK(term1)
    const formattedPostcode = isFullPostcode ? formatUKPostcode(term1) : term1
    title = `${formattedPostcode}, ${gazetteerEntry.DISTRICT_BOROUGH} - ${home.pageTitle}`
    headerTitle = `${formattedPostcode}, ${gazetteerEntry.DISTRICT_BOROUGH}`
    urlRoute = `${gazetteerEntry.NAME1}_${gazetteerEntry.DISTRICT_BOROUGH}`
  }

  return { title, headerTitle, urlRoute, term1 }
}

const handleCountyUnitary = (gazetteerEntry, locationNameOrPostcode, home) => {
  let title = ''
  let headerTitle = ''
  let urlRoute = ''
  let term1 = ''

  if (gazetteerEntry.NAME2) {
    title = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY} - ${home.pageTitle}`
    headerTitle = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY}`
    urlRoute = `${gazetteerEntry.NAME2}_${gazetteerEntry.COUNTY_UNITARY}`
    term1 = locationNameOrPostcode
  } else {
    title = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY} - ${home.pageTitle}`
    headerTitle = `${locationNameOrPostcode}, ${gazetteerEntry.COUNTY_UNITARY}`
    urlRoute = `${gazetteerEntry.NAME1}_${gazetteerEntry.COUNTY_UNITARY}`
    term1 = locationNameOrPostcode
  }

  return { title, headerTitle, urlRoute, term1 }
}

const getLanguageDates = (
  formattedDateSummary,
  getMonthSummary,
  calendarEnglish,
  calendarWelsh
) => {
  return {
    englishDate: `${formattedDateSummary[0]} ${calendarEnglish[getMonthSummary]} ${formattedDateSummary[2]}`,
    welshDate: `${formattedDateSummary[0]} ${calendarWelsh[getMonthSummary]} ${formattedDateSummary[2]}`
  }
}

const getFormattedDateSummary = (issueDate, calendarEnglish) => {
  const formattedDateSummary = moment(issueDate)
    .format('DD MMMM YYYY')
    .split(' ')
  const getMonthSummary = calendarEnglish.findIndex(function (item) {
    return item.indexOf(formattedDateSummary[1]) !== -1
  })
  return { getMonthSummary, formattedDateSummary }
}

const isSummaryDateToday = (issueDate) => {
  if (!issueDate) return false
  const today = moment().format('YYYY-MM-DD')
  const issueDateFormatted = moment(issueDate).format('YYYY-MM-DD')
  return today === issueDateFormatted
}

const getIssueTime = (issueDate) => {
  if (!issueDate) return '5:00am'
  const issueMoment = moment(issueDate)
  if (!issueMoment.isValid()) return '5:00am'
  return issueMoment.format('h:mma')
}

export {
  getTitleAndHeaderTitle,
  getLanguageDates,
  getFormattedDateSummary,
  isSummaryDateToday,
  getIssueTime
}
