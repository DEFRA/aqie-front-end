/* eslint-disable prettier/prettier */
const ozoneController = {
  handler: (request, h) => {
    return h.view('ozone/index', {
      pageTitle: 'Ozone(O₃) – Check local air quality – GOV.UK',
      heading: 'Check local air quality',
      page: 'ozone',
      lang: request.query.lang
    })
  }
}

export { ozoneController }
