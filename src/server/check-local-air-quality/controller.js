const checkLocalAirController = {
  handler: (request, h) => {
    return h.view('check-local-air-quality/index', {
      pageTitle: 'Check local air quality - GOV.UK',
      heading: 'Check local air quality',
      page: 'Check local air quality'
    })
  }
}

export { checkLocalAirController }
