import { config } from '~/src/config'
import { english } from '~/src/server/data/en/en.js'
const password = config.get('daqiePassword')
const homeController = {
  handler: (request, h) => {
    const { footerTxt, cookieBanner, login } = english
    /* eslint-disable camelcase */
    const { userId, utm_source } = request.query
    const query = request.yar.get('queryValues')
    if (request.auth.isAuthenticated) {
      if (query) {
        return h.redirect(
          `/?userId=${query.userId ?? userId}&utm_source=${query.utm_source ?? utm_source}`
        )
      } else {
        return h.redirect(
          `/?userId=${userId ?? userId}&utm_source=${utm_source ?? utm_source}`
        )
      }
    } else {
      const errors = request.yar.get('errors')
      const errorMessage = request.yar.get('errorMessage')
      request.yar.set('errors', null)
      request.yar.set('errorMessage', null)
      /* eslint-disable camelcase */
      request.yar.set('queryValues', { userId, utm_source })
      return h.view('home/index', {
        userId: query?.userId ?? userId,
        utm_source: query?.utm_source ?? utm_source,
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
      /* eslint-disable camelcase */
      const { userId, utm_source } = request.query
      return h.redirect(`/?userId=${userId}&utm_source=${utm_source}`)
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
