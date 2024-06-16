const checkLocalAirController = {
  handler: (request, h) => {
    const { query } = request
    return h.view('check-local-air-quality/index', {
      pageTitle: 'Check local air quality - GOV.UK',
      heading: 'Check local air quality',
      page: 'Check local air quality',
      lang: query.lang
    })
  }
}

export { checkLocalAirController }
