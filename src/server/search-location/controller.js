import { english } from '../data/en/en.js'
import {
  LANG_CY,
  LANG_EN,
  SEARCH_LOCATION_ROUTE_CY,
  REDIRECT_STATUS_CODE,
  LANG_SLICE_LENGTH
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

/**
 * Determines the language based on the request.
 * @param {Object} request - The Hapi request object.
 * @returns {string} The determined language.
 */
const determineLanguage = (request) => {
  const { query, path } = request
  const lang = query?.lang?.slice(0, LANG_SLICE_LENGTH)

  // Extracted nested ternary operation into an independent statement
  if (lang === LANG_CY || lang === LANG_EN) {
    return lang
  }

  return path === '/search-location' ? LANG_EN : LANG_CY
}

/**
 * Retrieves session data and clears errors if present.
 * @param {Object} request - The Hapi request object.
 * @returns {Object} Session data including errors, errorMessage, and locationType.
 */
const getSessionData = (request) => {
  const errors = request.yar.get('errors')
  const errorMessage = request.yar.get('errorMessage')
  const locationType = request.yar.get('locationType')

  if (errors) {
    request.yar.set('errors', null)
    request.yar.set('errorMessage', null)
  } else {
    request.yar.set('locationType', '')
  }

  return { errors, errorMessage, locationType }
}

/**
 * Prepares the view model for rendering the search location page.
 * @param {Object} options - Options for preparing the view model.
 * @param {Object} options.metaSiteUrl - The meta site URL.
 * @param {string} options.lang - The determined language.
 * @param {Object} options.errors - Errors from the session.
 * @param {Object} options.errorMessage - Error messages from the session.
 * @param {string} options.locationType - The location type from the session.
 * @param {boolean} options.isError - Whether there are errors.
 * @returns {Object} The view model for rendering the page.
 */
const prepareViewModel = ({
  metaSiteUrl,
  lang,
  errors,
  errorMessage,
  locationType,
  isError,
  fromSmsFlow,
  fromEmailFlow
}) => {
  const { searchLocation, footerTxt, phaseBanner, backlink, cookieBanner } =
    english

  return {
    pageTitle: isError
      ? `Error: ${searchLocation.pageTitle}`
      : searchLocation.pageTitle,
    description: searchLocation.description,
    metaSiteUrl,
    heading: searchLocation.heading,
    page: searchLocation.page,
    serviceName: searchLocation.serviceName,
    searchParams: {
      label: {
        text: searchLocation.searchParams.label.text,
        classes: 'govuk-label--l govuk-!-margin-bottom-6',
        isPageHeading: true
      },
      hint: {
        text: isError
          ? searchLocation.searchParams.hint.text1
          : searchLocation.searchParams.hint.text2
      },
      id: 'location',
      name: 'location'
    },
    locations: searchLocation.searchParams.locations,
    button: searchLocation.button,
    locationType: isError ? locationType : '',
    errors: errors?.errors ?? null,
    errorMessage: errorMessage?.errorMessage ?? null,
    errorMessageRadio: errorMessage?.errorMessage ?? null,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    currentPath: '/search-location',
    lang,
    fromSmsFlow,
    fromEmailFlow
  }
}

/**
 * The search location controller.
 */
const searchLocationController = {
  handler: (request, h) => {
    request.yar.set('locationNameOrPostcode', '')

    // '' Check if user is coming from notification registration flow (SMS or Email)
    const fromSmsFlow = request.query?.fromSmsFlow === 'true'
    const fromEmailFlow = request.query?.fromEmailFlow === 'true'

    if (fromSmsFlow) {
      request.yar.set('notificationFlow', 'sms')
    } else if (fromEmailFlow) {
      request.yar.set('notificationFlow', 'email')
    }

    const metaSiteUrl = getAirQualitySiteUrl(request)
    const lang = determineLanguage(request)

    if (lang === LANG_CY) {
      return h.redirect(SEARCH_LOCATION_ROUTE_CY).code(REDIRECT_STATUS_CODE)
    }

    const { errors, errorMessage, locationType } = getSessionData(request)

    const viewModel = prepareViewModel({
      metaSiteUrl,
      lang,
      errors,
      errorMessage,
      locationType,
      isError: !!errors,
      fromSmsFlow,
      fromEmailFlow
    })

    return h.view('search-location/index', viewModel)
  }
}

export { searchLocationController }
