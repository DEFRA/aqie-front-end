import { config } from '~/src/config'
import { english } from '~/src/server/data/en/en.js'
const password = config.get('daqiePassword')
const homeController = {
  handler: (request, h) => {
    const { footerTxt, cookieBanner, login } = english
    if (request.auth.isAuthenticated) {
      return h.redirect('/check-local-air-quality')
    } else {
      const errors = request.yar.get('errors')
      const errorMessage = request.yar.get('errorMessage')
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      return h.view('home/index', {
        pageTitle: login.pageTitle,
        heading: login.heading,
        texts: login.texts,
        page: 'home',
        footerTxt,
        cookieBanner,
        serviceName: '',
        errors: errors?.errors,
        errorMessage: errorMessage?.errorMessage
      })
    }
  }
}

const loginController = {
  handler: (request, h) => {
    if (request.payload.password === password) {
      request.cookieAuth.set({ password: request.payload.password })
      return h.redirect('/check-local-air-quality')
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
      return h.redirect('/')
    }
  }
}

export { homeController, loginController }
