import moment from 'moment-timezone'
import { createLogger } from '../common/helpers/logging/logger.js'
import { getIssueTime } from '../locations/helpers/middleware-helpers.js'

const moduleLogger = createLogger()
const DAILY_SUMMARY_KEY = 'dailySummary'
const ISSUE_DATE_FORMAT = 'YYYY-MM-DD'
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'DD MMMM YYYY'

function setFormattedDates(locationData, dateValue) {
  locationData.englishDate = dateValue.format(DATE_FORMAT)
  locationData.welshDate = dateValue.format(DATE_FORMAT)
}

function applyNoDailySummary(locationData) {
  locationData[DAILY_SUMMARY_KEY] = null
}

function applyOldDate(locationData) {
  if (!locationData[DAILY_SUMMARY_KEY]) {
    return
  }

  const yesterday = moment().subtract(1, 'days')
  locationData[DAILY_SUMMARY_KEY].issue_date = yesterday.format(DATETIME_FORMAT)
  setFormattedDates(locationData, yesterday)
}

function applyTodayDate(locationData) {
  const today = moment()
  if (!locationData[DAILY_SUMMARY_KEY]) {
    locationData[DAILY_SUMMARY_KEY] = {}
  }

  locationData[DAILY_SUMMARY_KEY].issue_date = today.format(DATETIME_FORMAT)
  setFormattedDates(locationData, today)
}

function applyNoDataOldDate(locationData) {
  const yesterday = moment().subtract(1, 'days')
  locationData[DAILY_SUMMARY_KEY] = {
    issue_date: yesterday.format(DATETIME_FORMAT)
  }
  setFormattedDates(locationData, yesterday)
}

const testModeHandlers = {
  noDailySummary: applyNoDailySummary,
  oldDate: applyOldDate,
  todayDate: applyTodayDate,
  noDataOldDate: applyNoDataOldDate
}

function updateSummaryMetadata(locationData) {
  locationData.showSummaryDate = isSummaryDateToday(
    locationData[DAILY_SUMMARY_KEY]?.issue_date
  )
  locationData.issueTime = getIssueTime(
    locationData[DAILY_SUMMARY_KEY]?.issue_date
  )
}

/**
 * Apply test mode changes to location data
 */
export function applyTestModeChanges(locationData, testMode, customLogger) {
  const log = customLogger || moduleLogger
  if (!testMode) {
    return
  }

  const testModeHandler = testModeHandlers[testMode]
  if (!testModeHandler) {
    log.warn(`Unknown testMode: ${testMode}`)
    return
  }

  testModeHandler(locationData)
  // Re-calculate showSummaryDate after any changes
  updateSummaryMetadata(locationData)
}

/**
 * Check if summary date is today
 */
function isSummaryDateToday(issueDate) {
  if (!issueDate) {
    return false
  }
  const today = moment().format(ISSUE_DATE_FORMAT)
  const issueDateFormatted = moment(issueDate).format(ISSUE_DATE_FORMAT)
  return today === issueDateFormatted
}

/**
 * Calculate and set summary date if not already set
 */
export function calculateSummaryDate(locationData, _customLogger) {
  if (
    locationData.showSummaryDate === undefined &&
    locationData[DAILY_SUMMARY_KEY]?.issue_date
  ) {
    const today = moment().format(ISSUE_DATE_FORMAT)
    const issueDate = moment(locationData[DAILY_SUMMARY_KEY].issue_date).format(
      ISSUE_DATE_FORMAT
    )
    locationData.showSummaryDate = today === issueDate
    locationData.issueTime = getIssueTime(
      locationData[DAILY_SUMMARY_KEY].issue_date
    )
    return
  }

  if (!locationData.issueTime && locationData[DAILY_SUMMARY_KEY]?.issue_date) {
    locationData.issueTime = getIssueTime(
      locationData[DAILY_SUMMARY_KEY].issue_date
    )
  }
}

/**
 * Determine location type from location data
 */
export function determineLocationType(locationData) {
  return locationData?.locationType || 'uk'
}
