const cookiesController = {
  handler: (request, h) => {
    return h.view('cookies/index', {
      pageTitle: 'Check local air quality - GOV.UK',
      heading: 'Check local air quality',
      page: 'cookies',
      serviceName: 'Check local air quality',
      lang: request.query.lang
    })
  }
}

export { cookiesController }
