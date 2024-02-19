/* eslint-disable prettier/prettier */
const sulphurDioxideController = {
  handler: (request, h) => {
    return h.view('sulphur-dioxide/index', {
      pageTitle: 'Sulphur dioxide (SO₂) – Check local air quality – GOV.UK',
      heading: 'Check local air quality',
      page: 'Sulphur dioxide (SO₂)'
    })
  }
}

export { sulphurDioxideController }
