/* eslint-disable prettier/prettier */
const nitrogenDioxideController = {
  handler: (request, h) => {
    return h.view('nitrogen-dioxide/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'homepage'
    })
  }
}

export { nitrogenDioxideController }
