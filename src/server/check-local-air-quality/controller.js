const checkLocalAirController = {
  handler: (request, h) => {
    return h.view('check-local-air-quality/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'check local air quality'
    })
  }
}

export { checkLocalAirController }
