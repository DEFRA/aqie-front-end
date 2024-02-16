/* eslint-disable prettier/prettier */
const particulateMatter10Controller = {
  handler: (request, h) => {
    return h.view('particulate-matter-10/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'particulate matter 10'
    })
  }
}

export { particulateMatter10Controller }
