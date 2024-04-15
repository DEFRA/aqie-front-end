import { config } from 'dotenv'

config()
const homeController = {
  handler: (request, h) => {
    if (request.auth.isAuthenticated) {
      return h.redirect('/aqie-front-end/check-local-air-quality')
    } else {
      const errors = request.yar.get('errors')
      const errorMessage = request.yar.get('errorMessage')
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      return h.view('home/index', {
        pageTitle: 'Check local air quality - GOV.UK',
        heading: 'Check local air quality',
        page: 'home',
        serviceName: 'Check local air quality',
        errors: errors?.errors,
        errorMessage: errorMessage?.errorMessage
      })
    }
  }
}

const loginController = {
  handler: (request, h) => {
    // test
    if (request.payload.password === process.env.AIR_QUALITY_PASSWORD) {
      request.cookieAuth.set({ password: request.payload.password })
      return h.redirect('/aqie-front-end/check-local-air-quality')
    } else {
      request.yar.set('errors', {
        errors: {
          titleText: 'There is a problem',
          errorList: [
            {
              text: 'The password is not correct',
              href: '#password'
            }
          ]
        }
      })
      request.yar.set('errorMessage', {
        errorMessage: {
          text: 'The password is not correct'
        }
      })
      return h.redirect('/aqie-front-end')
    }
  }
}

export { homeController, loginController }
