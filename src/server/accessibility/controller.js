const accessibilityController = {
  handler: (request, h) => {
    return h.view('accessibility/index', {
      pageTitle: 'Check local air quality - GOV.UK',
      heading: 'Check local air quality',
      page: 'accessibility',
      serviceName: 'Check local air quality',
      lang: request.query.lang
    })
  }
}

export { accessibilityController }
