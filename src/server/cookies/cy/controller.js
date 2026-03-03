import { welsh } from '../../data/cy/cy.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

// Define the handler function
const COOKIES_PATH_CY = '/briwsion/cy'
const cookiesHandler = (request, h, content = welsh) => {
  // Destructure necessary data from the imported 'content' object
  const {
    footer: {
      cookies: {
        pageTitle,
        title,
        heading,
        headings,
        table1,
        table2,
        paragraphs,
        description
      }
    },
    cookieBanner,
    phaseBanner,
    footerTxt,
    multipleLocations: { serviceName }
  } = content

  // Extract query parameters and path from the request
  const { query, path } = request
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Redirect to the English version if the language is LANG_EN
  if (query?.lang === LANG_EN) {
    return h.redirect(`/cookies?lang=en`).code(REDIRECT_STATUS_CODE)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, 2)
  if (lang !== LANG_CY && lang !== LANG_EN && path === COOKIES_PATH_CY) {
    lang = LANG_CY
  }
  // Ensure lang defaults to CY for /briwsion/cy path
  if (!lang && path === COOKIES_PATH_CY) {
    lang = LANG_CY
  }

  // Render the cookies page with the necessary data
  return h.view('cookies/index', {
    pageTitle,
    description,
    metaSiteUrl,
    title,
    heading,
    headings,
    table1,
    table2,
    paragraphs,
    displayBacklink: false,
    phaseBanner,
    footerTxt,
    serviceName,
    cookieBanner,
    currentPath: COOKIES_PATH_CY,
    lang
  })
}

// Define the controller using the handler function
const cookiesController = {
  handler: cookiesHandler
}

export { cookiesController, cookiesHandler }
