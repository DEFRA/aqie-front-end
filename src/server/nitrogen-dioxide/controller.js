/* eslint-disable prettier/prettier */
const nitrogenDioxideController = {
  handler: (request, h) => {
    return h.view('nitrogen-dioxide/index', {
      pageTitle: 'Nitrogen dioxide (NO₂) – Check local air quality – GOV.UK',
      heading: 'Check local air quality',
      page: 'Nitrogen dioxide (NO₂)'
    })
  }
}

export { nitrogenDioxideController }
