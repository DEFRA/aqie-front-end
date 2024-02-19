/* eslint-disable prettier/prettier */
const particulateMatter25Controller = {
  handler: (request, h) => {
    return h.view('particulate-matter-25/index', {
      pageTitle:
        'Particulate matter (PM2.5) – Check local air quality – GOV.UK',
      heading: 'Check local air quality',
      page: 'particulate matter 25'
    })
  }
}

export { particulateMatter25Controller }
