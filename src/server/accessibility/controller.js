import { english } from '../data/en/en.js'
import { welsh } from '../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  REDIRECT_STATUS_CODE,
  LANG_SLICE_LENGTH
} from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'

const ACCESSIBILITY_PATH = '/accessibility'

// Define the handler function
const accessibilityHandler = (request, h, content = english) => {
  // Extract the language query parameter from the request
  const { query, path } = request
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // Redirect to the Welsh version if the language is 'LANG_CY'
  if (query?.lang === LANG_CY) {
    return h
      .redirect(`/hygyrchedd/cy?lang=${query?.lang}`)
      .code(REDIRECT_STATUS_CODE)
  }

  // Determine the language
  let lang = query?.lang?.slice(0, LANG_SLICE_LENGTH)
  if (lang !== LANG_CY && lang !== LANG_EN && path === ACCESSIBILITY_PATH) {
    lang = LANG_EN
  }
  // Ensure lang defaults to EN for /accessibility path
  if (!lang && path === ACCESSIBILITY_PATH) {
    lang = LANG_EN
  }
  if (lang === LANG_EN) {
    content = english
  } else {
    content = welsh
  }
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
    currentPath: lang === LANG_EN ? ACCESSIBILITY_PATH : '/hygyrchedd/cy',
    lang
  })
}

// Define the controller using the handler function
const accessibilityController = {
  handler: accessibilityHandler
}

export { accessibilityController, accessibilityHandler }
