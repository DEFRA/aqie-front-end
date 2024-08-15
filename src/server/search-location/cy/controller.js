import { welsh } from '~/src/server/data/cy/cy.js'
const searchLocationController = {
  handler: (request, h) => {
    const { query } = request
    const { referer } = request.headers
    let lang = referer.slice(-2)
    if (lang === 'on') {
      lang = 'en'
    }
    if (query.lang === 'en') {
      /* eslint-disable camelcase */
      return h.redirect(
        `/search-location?lang=en&userId=${query.userId}&utm_source=${query.utm_source}`
      )
    }
    const errors = request.yar.get('errors')
    const errorMessage = request.yar.get('errorMessage')
    const locationType = request.yar.get('locationType')
    if (errors) {
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      const queryValues = request.yar.get('queryValues')
      return h.view('search-location/index', {
        userId: queryValues?.userId,
        utm_source: queryValues?.utm_source,
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
        userId: query?.userId,
        utm_source: query?.utm_source,
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
