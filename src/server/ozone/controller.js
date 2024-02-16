/* eslint-disable prettier/prettier */
const ozoneController = {
  handler: (request, h) => {
    return h.view('ozone/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'ozone'
    })
  }
}

export { ozoneController }
