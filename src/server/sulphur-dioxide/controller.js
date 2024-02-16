/* eslint-disable prettier/prettier */
const sulphurDioxideController = {
  handler: (request, h) => {
    return h.view('sulphur-dioxide/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'sulphur dioxide'
    })
  }
}

export { sulphurDioxideController }
