import { config } from '~/src/config'

const googleSiteTagId = config.get('googleSiteTagId')
const password = config.get('daqiePassword')
const homeController = {
  handler: (request, h) => {
    if (request.auth.isAuthenticated) {
      return h.redirect('/check-local-air-quality', { googleSiteTagId })
    } else {
      const errors = request.yar.get('errors')
      const errorMessage = request.yar.get('errorMessage')
      request.yar.flash('errors', null)
      request.yar.flash('errorMessage', null)
      return h.view('home/index', {
        pageTitle: 'Check local air quality - GOV.UK',
        heading: 'Check local air quality',
        page: 'home',
        serviceName: 'Check local air quality',
        errors: errors?.errors,
        errorMessage: errorMessage?.errorMessage,
        googleSiteTagId
      })
    }
  }
}

const loginController = {
  handler: (request, h) => {
    if (request.payload.password === password) {
      request.cookieAuth.flash({ password: request.payload.password })
      return h.redirect('/check-local-air-quality', { googleSiteTagId })
    } else {
      request.yar.flash('errors', {
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
      request.yar.flash('errorMessage', {
        errorMessage: {
          text: 'The password is not correct'
        }
      })
      return h.redirect('/')
    }
  }
}

export { homeController, loginController }
