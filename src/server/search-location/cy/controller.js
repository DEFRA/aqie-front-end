import { welsh } from '../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  SEARCH_LOCATION_ROUTE_EN,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const SEARCH_LOCATION_PATH_CY = '/chwilio-lleoliad/cy'

const getNotificationFlow = (fromSmsFlow = false, fromEmailFlow = false) =>
  fromSmsFlow ? 'sms' : fromEmailFlow ? 'email' : null

const getRequestLang = (query = {}, path = '') => {
  const lang = query?.lang?.slice(0, 2)

  if (
    lang !== LANG_CY &&
    lang !== LANG_EN &&
    path === SEARCH_LOCATION_PATH_CY
  ) {
    return LANG_CY
  }

  if (!lang && path === SEARCH_LOCATION_PATH_CY) {
    return LANG_CY
  }

  return lang
}

const clearRequestErrors = (request) => {
  const errors = request.yar.get('errors')
  const errorMessage = request.yar.get('errorMessage')
  const locationType = request.yar.get('locationType')

  if (errors) {
    request.yar.set('errors', null)
    request.yar.set('errorMessage', null)
  }

  return { errors, errorMessage, locationType }
}

function buildSearchLocationViewData({
  metaSiteUrl,
  lang,
  errors = null,
  errorMessage = null,
  locationType = null,
  fromSmsFlow = false,
  fromEmailFlow = false
}) {
  const baseData = {
    description: welsh.searchLocation.description,
    metaSiteUrl,
    heading: welsh.searchLocation.heading,
    page: welsh.searchLocation.page,
    serviceName: welsh.searchLocation.serviceName,
    locations: welsh.searchLocation.searchParams.locations,
    button: welsh.searchLocation.button,
    footerTxt: welsh.footerTxt,
    phaseBanner: welsh.phaseBanner,
    backlink: welsh.backlink,
    cookieBanner: welsh.cookieBanner,
    currentPath: SEARCH_LOCATION_PATH_CY,
    lang,
    fromSmsFlow,
    fromEmailFlow
  }

  if (errors) {
    return {
      ...baseData,
      pageTitle: `Gwall: ${welsh.searchLocation.pageTitle}`,
      searchParams: {
        label: {
          text: welsh.searchLocation.searchParams.label.text,
          classes: 'govuk-label--l govuk-!-margin-bottom-6',
          isPageHeading: true
        },
        hint: { text: welsh.searchLocation.searchParams.hint.text1 },
        id: 'location',
        name: 'location'
      },
      locationType,
      errors: errors.errors,
      errorMessage: errorMessage?.errorMessage,
      errorMessageRadio: errorMessage?.errorMessage
    }
  }

  return {
    ...baseData,
    pageTitle: welsh.searchLocation.pageTitle,
    searchParams: {
      label: {
        text: welsh.searchLocation.searchParams.label.text,
        classes: 'govuk-label--l govuk-!-margin-bottom-6',
        isPageHeading: true
      },
      hint: { text: welsh.searchLocation.searchParams.hint.text2 },
      id: 'location',
      name: 'location'
    }
  }
}

const searchLocationController = {
  handler: (request, h) => {
    const { query, path } = request
    request.yar.set('locationNameOrPostcode', '')
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // '' Check if user is coming from notification registration flow (SMS or Email)
    const fromSmsFlow = request.query?.fromSmsFlow === 'true'
    const fromEmailFlow = request.query?.fromEmailFlow === 'true'
    // ''
    const notificationFlow = getNotificationFlow(fromSmsFlow, fromEmailFlow)
    // ''

    if (notificationFlow) {
      request.yar.set('notificationFlow', notificationFlow)
    }

    // Ensure lang defaults to CY for Welsh search-location path
    const lang = getRequestLang(query, path)
    if (lang === LANG_EN) {
      return h.redirect(SEARCH_LOCATION_ROUTE_EN).code(REDIRECT_STATUS_CODE)
    }
    const { errors, errorMessage, locationType } = clearRequestErrors(request)

    const viewData = buildSearchLocationViewData({
      metaSiteUrl,
      lang,
      errors,
      errorMessage,
      locationType,
      fromSmsFlow,
      fromEmailFlow
    })

    return h.view('search-location/index', viewData)
  }
}

export { searchLocationController }
