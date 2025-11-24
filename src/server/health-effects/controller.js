// '' Unified health effects controller (EN & CY)
import { english } from '../data/en/en.js' // ''
import { welsh } from '../data/cy/cy.js' // ''
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js' // ''
import { createLogger } from '../common/helpers/logging/logger.js' // ''
import {
  getReadableLocationName,
  buildHealthEffectsViewModel
} from './helpers/index.js' // ''

const LANG_EN = 'en' // ''
const LANG_CY = 'cy'
const REDIRECT_STATUS_CODE = 302

const logger = createLogger() // ''

// '' Unified handler for both languages
const healthEffectsHandler = (request, h, customContent = undefined) => {
  try {
    const { query = {}, params = {} } = request // ''
    const metaSiteUrl = getAirQualitySiteUrl(request) // ''
    const lang = (query.lang || '').toLowerCase() // ''

    // '' Only render the page for the matching route and language
    const isWelshRoute = request.path.startsWith('/lleoliad/')
    const isEnglishRoute = request.path.startsWith('/location/')

    // '' If Welsh route, always render Welsh page
    if (isWelshRoute) {
      const readableName = getReadableLocationName(query, params, logger) // ''
      const selectedContent = customContent || welsh // ''
      const viewModel = buildHealthEffectsViewModel({
        content: selectedContent,
        metaSiteUrl,
        readableName,
        lang: LANG_CY, // ''
        locationId: params.id // ''
      }) // ''
      viewModel.page = 'Effaith llygredd aer ar iechyd' // ''
      viewModel.pageTitle = 'Effaith llygredd aer ar iechyd' // ''
      viewModel.backLinkText = `Llygredd aer yn ${readableName || 'y lleoliad hwn'}` // ''
      viewModel.backlink = { text: viewModel.backLinkText, href: viewModel.backLinkUrl } // ''
      logger.debug(
        {
          routePath: request.path,
          readableName,
          backLinkUrl: viewModel.backLinkUrl
        },
        "'' Rendering health-effects CY" // ''
      )
      return h.view('health-effects/cy/index', viewModel) // ''
    }

    // '' If English route, always render English page
    if (isEnglishRoute) {
      const readableName = getReadableLocationName(query, params, logger) // ''
      const selectedContent = customContent || english // ''
      const viewModel = buildHealthEffectsViewModel({
        content: selectedContent,
        metaSiteUrl,
        readableName,
        lang: LANG_EN, // ''
        locationId: params.id // ''
      }) // ''
      logger.debug(
        {
          routePath: request.path,
          readableName,
          backLinkUrl: viewModel.backLinkUrl
        },
        "'' Rendering health-effects EN" // ''
      )
      return h.view('health-effects/index', viewModel) // ''
    }

    // '' If route does not match, return 404
    logger.warn({ routePath: request.path }, "'' Health effects route not found") // ''
    return h.response('Page Not Found').code(404) // ''
  } catch (err) {
    logger.error(err, "'' Failed to render health-effects") // ''
    return h.response('Internal Server Error').code(500) // ''
  }
}

const healthEffectsController = { handler: healthEffectsHandler } // ''

export { healthEffectsController, healthEffectsHandler } // ''