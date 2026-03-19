import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { welsh } from '../../../data/cy/cy.js'
import { LANG_CY, NOT_PROVIDED } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'
import { resolveNotifyLanguage } from '../helpers/resolve-notify-language.js'
import { config } from '../../../../config/index.js'

const LOCATION_PLACEHOLDER = '{location}'
const MISSING_VALUE = 'MISSING'
const SMS_MOBILE_NUMBER_PATH_KEY = 'notify.smsMobileNumberPath'
const DEFAULT_SERVICE_NAME = 'Check air quality'

const logger = createLogger()

const getLanguageContent = (request, content = english) => {
  const lang = resolveNotifyLanguage(request)
  const languageContent = lang === LANG_CY ? welsh : content
  return { lang, languageContent }
}

const buildSmsMobileNumberUrl = ({
  location = '',
  locationId = '',
  lat,
  long
} = {}) => {
  const queryParams = new URLSearchParams()
  if (location) {
    queryParams.set('location', location)
  }
  if (locationId) {
    queryParams.set('locationId', locationId)
  }
  if (lat) {
    queryParams.set('lat', lat)
  }
  if (long) {
    queryParams.set('long', long)
  }

  const queryString = queryParams.toString()
  const smsMobileNumberPath = config.get(SMS_MOBILE_NUMBER_PATH_KEY)
  return queryString
    ? `${smsMobileNumberPath}?${queryString}`
    : smsMobileNumberPath
}

const buildDuplicateAlertErrorViewModel = ({
  duplicateAlertError,
  duplicateAlertLocation,
  smsConfirmDetails,
  safeLocation
}) => {
  if (!duplicateAlertError) {
    return null
  }

  return {
    summary: smsConfirmDetails.errors.duplicateAlert.summary.replace(
      LOCATION_PLACEHOLDER,
      duplicateAlertLocation || safeLocation
    ),
    message: smsConfirmDetails.errors.duplicateAlert.field
  }
}

const getConfirmDetailsContext = (request, content = english) => {
  const { lang, languageContent } = getLanguageContent(request, content)
  return {
    lang,
    languageContent,
    smsConfirmDetails:
      languageContent.smsConfirmDetails || english.smsConfirmDetails,
    common: languageContent.common || english.common,
    metaSiteUrl: getAirQualitySiteUrl(request)
  }
}

const logConfirmDetailsRenderError = (request, error) => {
  const hasSession = Boolean(request && request.yar)
  const hasLocation = hasSession ? Boolean(request.yar.get('location')) : false
  const hasLocationId = hasSession
    ? Boolean(request.yar.get('locationId'))
    : false
  const hasMobileNumber = hasSession
    ? Boolean(request.yar.get('mobileNumber'))
    : false

  logger.error('Failed to render sms-confirm-details page', {
    error,
    hasSession,
    hasLocation,
    hasLocationId,
    hasMobileNumber
  })
}

const consumeDuplicateAlertState = (request) => {
  const duplicateAlertError = request.yar.get('duplicateAlertError')
  const duplicateAlertLocation = request.yar.get('duplicateAlertLocation')

  if (duplicateAlertError) {
    request.yar.clear('duplicateAlertError')
    request.yar.clear('duplicateAlertLocation')
  }

  return { duplicateAlertError, duplicateAlertLocation }
}

const getConfirmDetailsSessionData = (request) => ({
  mobileNumber: request.yar.get('mobileNumber') || NOT_PROVIDED,
  location: request.yar.get('location'),
  locationId: request.yar.get('locationId'),
  lat: request.yar.get('latitude'),
  long: request.yar.get('longitude'),
  locationData: request.yar.get('locationData'),
  notificationFlow: request.yar.get('notificationFlow'),
  searchTermsSaved: request.yar.get('searchTermsSaved')
})

const logConfirmDetailsSessionData = (request, sessionData) => {
  const {
    mobileNumber,
    location,
    locationId,
    lat,
    long,
    locationData,
    notificationFlow,
    searchTermsSaved
  } = sessionData

  logger.info('Session debug - checking all keys', {
    hasMobileNumber: !!mobileNumber && mobileNumber !== NOT_PROVIDED,
    hasLocation: !!location,
    hasLocationId: !!locationId,
    hasLatitude: !!lat,
    hasLongitude: !!long,
    hasLocationData: !!locationData,
    hasNotificationFlow: !!notificationFlow,
    hasSearchTermsSaved: !!searchTermsSaved,
    sessionId: request.yar.id,
    values: {
      mobileNumber: mobileNumber !== NOT_PROVIDED ? '[REDACTED]' : NOT_PROVIDED,
      location: location || MISSING_VALUE,
      locationId: locationId || MISSING_VALUE,
      latitude: lat || MISSING_VALUE,
      longitude: long || MISSING_VALUE,
      locationDataKeys: locationData
        ? Object.keys(locationData)
        : MISSING_VALUE,
      notificationFlow: notificationFlow || MISSING_VALUE,
      searchTermsSaved: searchTermsSaved || MISSING_VALUE
    }
  })
}

const redirectForMissingLocation = ({ request, h, location, locationId }) => {
  if (!location && locationId) {
    logger.warn(
      'Missing location in session, redirecting to search for SMS flow',
      {
        hasLocationId: true,
        locationId
      }
    )
    request.yar.set('notificationFlow', 'sms')
    return h.redirect('/search-location?fromSmsFlow=true')
  }

  if (!location && !locationId) {
    logger.error('Missing location and locationId in session', {
      hasLocation: false,
      hasLocationId: false
    })
    return h.redirect('/search-location?fromSmsFlow=true')
  }

  return null
}

const buildConfirmDetailsViewModel = ({
  request,
  lang,
  languageContent,
  smsConfirmDetails,
  common,
  metaSiteUrl,
  safeLocation,
  locationId,
  lat,
  long,
  mobileNumber,
  duplicateAlertError,
  duplicateAlertLocation
}) => {
  const changeMobileNumberUrl = buildSmsMobileNumberUrl({
    location: safeLocation,
    locationId,
    lat,
    long
  })

  const heading = smsConfirmDetails.heading.replace(
    LOCATION_PLACEHOLDER,
    safeLocation
  )
  const forecastAlert = smsConfirmDetails.alertTypes.forecast.replace(
    LOCATION_PLACEHOLDER,
    safeLocation
  )
  const monitoringAlert = smsConfirmDetails.alertTypes.monitoring.replace(
    LOCATION_PLACEHOLDER,
    safeLocation
  )
  const serviceName = common?.serviceName || DEFAULT_SERVICE_NAME

  return {
    pageTitle: duplicateAlertError
      ? `Error: ${smsConfirmDetails.pageTitle} - ${serviceName} - GOV.UK`
      : `${smsConfirmDetails.pageTitle} - ${serviceName} - GOV.UK`,
    heading,
    page: heading,
    serviceName,
    lang,
    metaSiteUrl,
    currentPath: request.path,
    footerTxt: languageContent.footerTxt,
    phaseBanner: languageContent.phaseBanner,
    cookieBanner: languageContent.cookieBanner,
    displayBacklink: true,
    customBackLink: true,
    backLinkText: common?.backLinkText || 'Back',
    backLinkUrl: config.get('notify.smsVerifyCodePath'),
    common,
    content: smsConfirmDetails,
    changeMobileNumberUrl,
    mobileNumber,
    location: safeLocation,
    forecastAlert,
    monitoringAlert,
    formData: request.yar.get('formData') || {},
    duplicateAlertError: buildDuplicateAlertErrorViewModel({
      duplicateAlertError,
      duplicateAlertLocation,
      smsConfirmDetails,
      safeLocation
    })
  }
}

export {
  getConfirmDetailsContext,
  logConfirmDetailsRenderError,
  consumeDuplicateAlertState,
  getConfirmDetailsSessionData,
  logConfirmDetailsSessionData,
  redirectForMissingLocation,
  buildConfirmDetailsViewModel
}
