import { english } from '~/src/server/data/en/en.js'
import {
  LANG_CY,
  LANG_EN,
  SEARCH_LOCATION_ROUTE_CY
} from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

/**
 * Determines the language based on the request.
 * @param {Object} request - The Hapi request object.
 * @returns {string} The determined language.
 */
const determineLanguage = (request) => {
  const { query, path } = request
  const lang = query?.lang?.slice(0, 2)

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
  isError
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
    locationType,
    errors: errors?.errors,
    errorMessage: errorMessage?.errorMessage,
    errorMessageRadio: errorMessage?.errorMessage,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    lang
  }
}

/**
 * The search location controller.
 */
const searchLocationController = {
  handler: (request, h) => {
    const metaSiteUrl = getAirQualitySiteUrl(request)
    const lang = determineLanguage(request)

    if (lang === LANG_CY) {
      return h.redirect(SEARCH_LOCATION_ROUTE_CY)
    }

    const { errors, errorMessage, locationType } = getSessionData(request)

    const viewModel = prepareViewModel({
      metaSiteUrl,
      lang,
      errors,
      errorMessage,
      locationType,
      isError: !!errors
    })

    return h.view('search-location/index', viewModel)
  }
}

export { searchLocationController }
