/* eslint-disable prettier/prettier */
const particulateMatter10Controller = {
  handler: (request, h) => {
    return h.view('particulate-matter-10/index', {
      pageTitle: 'Particulate matter (PM10) – Check local air quality – GOV.UK',
      heading: 'Check local air quality',
      page: 'particulate matter 10'
    })
  }
}

export { particulateMatter10Controller }
