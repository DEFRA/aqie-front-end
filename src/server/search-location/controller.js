import { english } from '~/src/server/data/en/en.js'

const searchLocationController = {
  handler: (request, h) => {
    const { query, path } = request
    let lang = query?.lang?.slice(0, 2)
    if (lang !== 'cy' && lang !== 'en' && path === '/search-location') {
      lang = 'en'
    }
    if (query.lang === 'cy') {
      /* eslint-disable camelcase */
      return h.redirect(`/chwilio-lleoliad/cy?lang=cy`)
    }
    const errors = request.yar.get('errors')
    const errorMessage = request.yar.get('errorMessage')
    const locationType = request.yar.get('locationType')
    if (errors) {
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      return h.view('search-location/index', {
        pageTitle: `Error: ${english.searchLocation.pageTitle}`,
        metaDescription: english.searchLocation.description,
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
