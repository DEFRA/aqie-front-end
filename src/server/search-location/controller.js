import { english } from '~/src/server/data/en/en.js'

const searchLocationController = {
  handler: (request, h) => {
    const { query } = request
    const { searchLocation, footerTxt, phaseBanner, backlink, cookieBanner } =
      english
    if (query.lang === 'cy') {
      return h.redirect('/chwilio-lleoliad/cy')
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
            text: searchLocation.searchParams.hint.text1 // 'Enter a location or postcode'
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
        lang: request.query.lang
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
            text: searchLocation.searchParams.hint.text1 // 'Enter a location or postcode'
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
        lang: request.query.lang
      })
    }
  }
}

export { searchLocationController }
