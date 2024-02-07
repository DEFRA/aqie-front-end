const homeController = {
  handler: (request, h) => {
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Example'
        }
      ]
    })
  }
}

export { homeController }
