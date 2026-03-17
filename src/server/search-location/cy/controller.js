import { welsh } from '../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  SEARCH_LOCATION_ROUTE_EN,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const searchLocationController = {
  handler: (request, h) => {
    const { query, path } = request
    request.yar.set('locationNameOrPostcode', '')
    const metaSiteUrl = getAirQualitySiteUrl(request)

    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== LANG_EN &&
      path === '/chwilio-lleoliad/cy'
    ) {
      lang = LANG_CY
    }
    // Ensure lang defaults to CY for Welsh search-location path
    if (!lang && path === '/chwilio-lleoliad/cy') {
      lang = LANG_CY
    }
    if (lang === LANG_EN) {
      return h.redirect(SEARCH_LOCATION_ROUTE_EN).code(REDIRECT_STATUS_CODE)
    }
    const errors = request.yar.get('errors')
    const errorMessage = request.yar.get('errorMessage')

    if (errors) {
      const locationType = request.yar.get('locationType')
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      return h.view('search-location/index', {
        pageTitle: `Gwall: ${welsh.searchLocation.pageTitle}`,
        description: welsh.searchLocation.description,
        metaSiteUrl,
        heading: welsh.searchLocation.heading,
        page: welsh.searchLocation.page,
        serviceName: welsh.searchLocation.serviceName,
        searchParams: {
          label: {
            text: welsh.searchLocation.searchParams.label.text,
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: welsh.searchLocation.searchParams.hint.text1
          },
          id: 'location',
          name: 'location'
        },
        locations: welsh.searchLocation.searchParams.locations,
        button: welsh.searchLocation.button,
        locationType,
        errors: errors.errors,
        errorMessage: errorMessage?.errorMessage,
        errorMessageRadio: errorMessage?.errorMessage,
        footerTxt: welsh.footerTxt,
        phaseBanner: welsh.phaseBanner,
        backlink: welsh.backlink,
        cookieBanner: welsh.cookieBanner,
        currentPath: '/chwilio-lleoliad/cy',
        lang
      })
    } else {
      return h.view('search-location/index', {
        pageTitle: welsh.searchLocation.pageTitle,
        description: welsh.searchLocation.description,
        metaSiteUrl,
        heading: welsh.searchLocation.heading,
        page: welsh.searchLocation.page,
        serviceName: welsh.searchLocation.serviceName,
        searchParams: {
          label: {
            text: welsh.searchLocation.searchParams.label.text,
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: welsh.searchLocation.searchParams.hint.text2
          },
          id: 'location',
          name: 'location'
        },
        locations: welsh.searchLocation.searchParams.locations,
        button: welsh.searchLocation.button,
        footerTxt: welsh.footerTxt,
        phaseBanner: welsh.phaseBanner,
        backlink: welsh.backlink,
        cookieBanner: welsh.cookieBanner,
        currentPath: '/chwilio-lleoliad/cy',
        lang
      })
    }
  }
}

export { searchLocationController }
