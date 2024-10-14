const searchLocationController = {
  handler: (request, h) => {
    const { query } = request
    return h.view('location-not-found/index', {
      pageTitle: 'Check local air quality - GOV.UK',
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
      },
      lang: query.lang
    })
  }
}

export { searchLocationController }
