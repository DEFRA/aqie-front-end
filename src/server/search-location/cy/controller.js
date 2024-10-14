import { welsh } from '~/src/server/data/cy/cy.js'
const searchLocationController = {
  handler: (request, h) => {
    const { query } = request
    if (query.lang === 'en') {
      /* eslint-disable camelcase */
      return h.redirect(`/search-location?lang=en`)
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
        lang: request.query.lang
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
        lang: request.query.lang
      })
    }
  }
}

export { searchLocationController }
