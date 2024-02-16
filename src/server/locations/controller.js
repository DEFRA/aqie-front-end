const searchLocationController = {
  handler: (request, h) => {
    return h.view('search-location/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'location',
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
      }
    })
  }
}

export { searchLocationController }
