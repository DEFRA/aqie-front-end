const homeController = {
  handler: (request, h) => {
    return h.view('home/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'homepage'
    })
  }
}

export { homeController }
