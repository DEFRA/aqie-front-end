import { english } from '~/src/server/data/en/en.js'
import { LANG_CY, LANG_EN } from '~/src/server/data/constants'
import { getAirQualitySiteUrl } from '~/src/server/common/helpers/get-site-url'

// Define the handler function
const accessibilityHandler = (request, h, content = english) => {
  // Destructure necessary data from the imported 'content' object
  const {
    footer: {
      accessibility: {
        paragraphs,
        pageTitle,
        title,
        headings,
        heading,
        description
      }
    },
    cookieBanner,
    phaseBanner,
    footerTxt,
    multipleLocations: { serviceName }
  } = content

  // Extract the language query parameter from the request
  const { query, path } = request
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Redirect to the Welsh version if the language is 'LANG_CY'
  if (query?.lang === LANG_CY) {
    return h.redirect(`/hygyrchedd/cy?lang=${query?.lang}`)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, 2)
  if (lang !== LANG_CY && lang !== LANG_EN && path === '/accessibility') {
    lang = LANG_EN
  }

  // Render the accessibility page with the necessary data
  return h.view('accessibility/index', {
    pageTitle,
    description,
    metaSiteUrl,
    title,
    heading,
    headings,
    paragraphs,
    displayBacklink: false,
    phaseBanner,
    footerTxt,
    serviceName,
    cookieBanner,
    lang
  })
}

// Define the controller using the handler function
const accessibilityController = {
  handler: accessibilityHandler
}

export { accessibilityController, accessibilityHandler }
