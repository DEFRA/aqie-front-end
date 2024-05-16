import { config } from '~/src/config'

const googleSiteTagId = config.get('googleSiteTagId')
const searchLocationController = {
  handler: (request, h) => {
    const errors = request.yar.get('errors')
    const errorMessage = request.yar.get('errorMessage')
    const locationType = request.yar.get('locationType')
    if (errors) {
      request.yar.flash('errors', null)
      request.yar.flash('errorMessage', null)
      return h.view('search-location/index', {
        pageTitle: 'Check local air quality - GOV.UK',
        heading: 'Check local air quality',
        page: 'search-location',
        serviceName: 'Check local air quality',
        searchParams: {
          label: {
            text: 'Where do you want to check?',
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: 'Enter a location or postcode'
          },
          id: 'location',
          name: 'location'
        },
        locationType,
        errors: errors.errors,
        errorMessage: errorMessage?.errorMessage,
        errorMessageRadio: errorMessage?.errorMessage
      })
    } else {
      return h.view('search-location/index', {
        pageTitle: 'Check local air quality - GOV.UK',
        heading: 'Check local air quality',
        page: 'search-location',
        serviceName: 'Check local air quality',
        searchParams: {
          label: {
            text: 'Where do you want to check?',
            classes: 'govuk-label--l govuk-!-margin-bottom-6',
            isPageHeading: true
          },
          hint: {
            text: 'Enter a location or postcode'
          },
          id: 'location',
          name: 'location'
        },
        googleSiteTagId
      })
    }
  }
}

export { searchLocationController }
