import { welsh } from '~/src/server/data/cy/cy.js'
const searchLocationController = {
  handler: (request, h) => {
    const { query } = request
    const { referer } = request.headers
    let lang = referer.slice(-2)
    if (lang === 'on') {
      lang = 'en'
    }
    const { searchLocation, footerTxt, phaseBanner, backlink, cookieBanner } =
      welsh
    if (query.lang === 'en') {
      /* eslint-disable camelcase */
      const { userId, utm_source } = request.query
      return h.redirect(
        `/search-location??lang=en&userId=${userId}&utm_source=${utm_source}`
      )
    }
    const errors = request.yar.get('errors')
    const errorMessage = request.yar.get('errorMessage')
    const locationType = request.yar.get('locationType')
    if (errors) {
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      return h.view('search-location/index', {
        pageTitle: searchLocation.pageTitle, // 'Check local air quality - GOV.UK',
        heading: searchLocation.heading, // 'Check local air quality',
        page: searchLocation.page, // 'search-location',
        serviceName: searchLocation.serviceName, // 'Check local air quality',
        searchParams: {
          label: {
            text: searchLocation.searchParams.label.text, // 'Where do you want to check?',
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: searchLocation.searchParams.hint.text2 // 'Enter a location or postcode'
          },
          id: 'location',
          name: 'location'
        },
        locations: searchLocation.searchParams.locations,
        button: searchLocation.button,
        locationType,
        errors: errors.errors,
        errorMessage: errorMessage?.errorMessage,
        errorMessageRadio: errorMessage?.errorMessage,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        lang: 'cy'
      })
    } else {
      return h.view('search-location/index', {
        pageTitle: searchLocation.pageTitle, // 'Check local air quality - GOV.UK',
        heading: searchLocation.heading, // 'Check local air quality',
        page: searchLocation.page, // 'search-location',
        serviceName: searchLocation.serviceName, // 'Check local air quality',
        searchParams: {
          label: {
            text: searchLocation.searchParams.label.text, // 'Where do you want to check?',
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: searchLocation.searchParams.hint.text2 // 'Enter a location or postcode'
          },
          id: 'location',
          name: 'location'
        },
        locations: searchLocation.searchParams.locations,
        button: searchLocation.button,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        lang: 'cy'
      })
    }
  }
}

export { searchLocationController }
