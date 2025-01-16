import { welsh } from '~/src/server/data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  SEARCH_LOCATION_ROUTE_EN
} from '~/src/server/data/constants'

const searchLocationController = {
  handler: (request, h) => {
    const { query, path } = request
    let lang = query?.lang?.slice(0, 2)
    if (
      lang !== LANG_CY &&
      lang !== LANG_EN &&
      path === '/chwilio-lleoliad/cy'
    ) {
      lang = LANG_CY
    }
    if (lang === LANG_EN) {
      return h.redirect(SEARCH_LOCATION_ROUTE_EN)
    }
    const errors = request.yar.get('errors')
    const errorMessage = request.yar.get('errorMessage')
    const locationType = request.yar.get('locationType')

    if (errors) {
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      return h.view('search-location/index', {
        pageTitle: `Gwall: ${welsh.searchLocation.pageTitle}`,
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
        lang
      })
    } else {
      return h.view('search-location/index', {
        pageTitle: welsh.searchLocation.pageTitle,
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
        lang
      })
    }
  }
}

export { searchLocationController }
