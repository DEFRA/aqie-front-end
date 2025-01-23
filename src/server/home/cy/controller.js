import { welsh } from '~/src/server/data/cy/cy.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

// Define the handler function
const handleHomeRequest = (request, h, content = welsh) => {
  const { query } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Redirect to the English version if the language is 'en'
  if (query.lang === LANG_EN) {
    return h.redirect(`/?lang=en`)
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
