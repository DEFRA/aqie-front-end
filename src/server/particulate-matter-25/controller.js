/* eslint-disable prettier/prettier */
const particulateMatter25Controller = {
  handler: (request, h) => {
    return h.view('particulate-matter-25/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'particulate matter 25'
    })
  }
}

export { particulateMatter25Controller }
