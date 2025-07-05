import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

// Define the handler function
const handleHomeRequest = (request, h, content = welsh) => {
  const { query, path } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Redirect to the English version if the language is 'en'
  if (query.lang === LANG_EN) {
    return h.redirect(`/?lang=en`).code(REDIRECT_STATUS_CODE)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, 2)
  if (lang !== LANG_CY && lang !== LANG_EN && path === '/cy') {
    lang = LANG_CY
  }

  // Render the home page with the necessary data
  return h.view('home/index', {
    pageTitle: home.pageTitle,
    description: home.description,
    metaSiteUrl,
    heading: home.heading,
    page: home.page,
    paragraphs: home.paragraphs,
    label: home.button,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName: '',
    lang: LANG_CY
  })
}

// Define the controller using the handler function
const homeController = {
  handler: handleHomeRequest
}

export { homeController, handleHomeRequest }
