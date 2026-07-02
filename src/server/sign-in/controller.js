import { config } from '../../config/index.js'
import { english } from '../data/en/en.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const VIEW_PATH = 'sign-in/index'

const buildViewModel = (request, errorMessage = null) => {
  const { footerTxt, phaseBanner, cookieBanner } = english
  return {
    pageTitle: errorMessage ? 'Error: Sign in' : 'Sign in',
    serviceName: 'Check air quality',
    lang: 'en',
    metaSiteUrl: getAirQualitySiteUrl(request),
    currentPath: '/sign-in',
    footerTxt,
    phaseBanner,
    cookieBanner,
    hideLanguageToggle: true,
    errorMessage
  }
}

export const handleSignInGet = (request, h) => {
  if (request.yar.get('authenticated')) {
    return h.redirect('/')
  }
  return h.view(VIEW_PATH, buildViewModel(request))
}

export const handleSignInPost = (request, h) => {
  const { username, password } = request.payload ?? {}
  const validUsername = config.get('signIn.username')
  const validPassword = config.get('signIn.password')

  if (username === validUsername && password === validPassword) {
    request.yar.set('authenticated', true)
    const redirectTo = request.yar.get('signInRedirectTo') || '/'
    request.yar.clear('signInRedirectTo')
    return h.redirect(redirectTo)
  }

  return h.view(
    VIEW_PATH,
    buildViewModel(request, 'Incorrect username or password')
  )
}
