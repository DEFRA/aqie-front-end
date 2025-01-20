import { english } from '~/src/server/data/en/en.js'
import {
  LANG_CY,
  LANG_EN,
  SEARCH_LOCATION_ROUTE_CY
} from '~/src/server/data/constants'

const searchLocationController = {
  handler: (request, h) => {
    const { query, path } = request
    let lang = query?.lang?.slice(0, 2)
    if (lang !== LANG_CY && lang !== LANG_EN && path === '/search-location') {
      lang = LANG_EN
    }
    if (lang === LANG_CY) {
      return h.redirect(SEARCH_LOCATION_ROUTE_CY)
    }
    const errors = request.yar.get('errors')
    const errorMessage = request.yar.get('errorMessage')
    const locationType = request.yar.get('locationType')
    if (errors) {
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      return h.view('search-location/index', {
        pageTitle: `Error: ${english.searchLocation.pageTitle}`,
        description: english.searchLocation.description,
        heading: english.searchLocation.heading,
        page: english.searchLocation.page,
        serviceName: english.searchLocation.serviceName,
        searchParams: {
          label: {
            text: english.searchLocation.searchParams.label.text,
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: english.searchLocation.searchParams.hint.text1
          },
          id: 'location',
          name: 'location'
        },
        locations: english.searchLocation.searchParams.locations,
        button: english.searchLocation.button,
        locationType,
        errors: errors.errors,
        errorMessage: errorMessage?.errorMessage,
        errorMessageRadio: errorMessage?.errorMessage,
        footerTxt: english.footerTxt,
        phaseBanner: english.phaseBanner,
        backlink: english.backlink,
        cookieBanner: english.cookieBanner,
        lang
      })
    } else {
      return h.view('search-location/index', {
        pageTitle: english.searchLocation.pageTitle,
        description: english.searchLocation.description,
        heading: english.searchLocation.heading,
        page: english.searchLocation.page,
        serviceName: english.searchLocation.serviceName,
        searchParams: {
          label: {
            text: english.searchLocation.searchParams.label.text,
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: english.searchLocation.searchParams.hint.text2
          },
          id: 'location',
          name: 'location'
        },
        locations: english.searchLocation.searchParams.locations,
        button: english.searchLocation.button,
        footerTxt: english.footerTxt,
        phaseBanner: english.phaseBanner,
        backlink: english.backlink,
        cookieBanner: english.cookieBanner,
        lang
      })
    }
  }
}

export { searchLocationController }
