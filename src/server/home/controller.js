const homeController = {
  handler: (request, h) => {
    if (request.auth.isAuthenticated) {
      return h.redirect('/aqie-front-end/check-local-air-quality')
    } else {
      return h.view('home/index', {
        pageTitle: 'Check local air quality',
        heading: 'Check local air quality',
        page: 'home',
        serviceName: 'Check local air quality'
      })
    }
  }
}

const loginController = {
  handler: (request, h) => {
    if (request.payload.password === 'n1tr0g3n') {
      request.cookieAuth.set({ password: request.payload.password })
      return h.redirect('/aqie-front-end/check-local-air-quality')
    } else {
      return h.redirect('/aqie-front-end')
    }
  }
}

export { homeController, loginController }
