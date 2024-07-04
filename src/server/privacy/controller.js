/* eslint-disable prettier/prettier */
const privacyController = {
  handler: (request, h) => {
    return h.view('privacy/index', {
      pageTitle: 'Check local air quality - GOV.UK',
      heading: 'Check local air quality',
      page: 'privacy',
      lang: request.query.lang
    })
  }
}

export { privacyController }
