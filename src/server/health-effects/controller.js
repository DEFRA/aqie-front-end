// '' Unified health effects controller (EN & CY)
import { english } from '../data/en/en.js' // ''
import { welsh } from '../data/cy/cy.js' // ''
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js' // ''
import { createLogger } from '../common/helpers/logging/logger.js' // ''
import {
  getReadableLocationName,
  buildHealthEffectsViewModel,
  buildBackLinkModel
} from './helpers/index.js' // ''

const LANG_EN = 'en' // ''
const LANG_CY = 'cy'

const logger = createLogger() // ''

// '' Unified handler for both languages
const healthEffectsHandler = (request, h, customContent = undefined) => {
  try {
    const { query = {}, params = {} } = request // ''
    const metaSiteUrl = getAirQualitySiteUrl(request) // ''

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
      // Restore original context-specific back link text
      viewModel.backLinkText = `Llygredd aer yn ${readableName || 'y lleoliad hwn'}`
      viewModel.backlink = {
        text: viewModel.backLinkText,
        href: viewModel.backLinkUrl
      }
      logger.debug(
        {
          routePath: request.path,
          readableName,
          backLinkUrl: viewModel.backlink.href
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
      // Use helper to build back link for EN
      viewModel.backLinkText = `Air pollution in ${readableName || 'this location'}`
      // viewModel.backLinkUrl is already set by buildHealthEffectsViewModel
      viewModel.backlink = buildBackLinkModel({
        backLinkText: viewModel.backLinkText,
        backLinkUrl: viewModel.backLinkUrl
      })
      logger.debug(
        {
          routePath: request.path,
          readableName,
          backLinkUrl: viewModel.backlink.href
        },
        "'' Rendering health-effects EN" // ''
      )
      return h.view('health-effects/index', viewModel) // ''
    }

    // '' If route does not match, return 404
    logger.warn(
      { routePath: request.path },
      "'' Health effects route not found"
    ) // ''
    return h.response('Page Not Found').code(404) // ''
  } catch (err) {
    logger.error(err, "'' Failed to render health-effects") // ''
    return h.response('Internal Server Error').code(500) // ''
  }
}

const healthEffectsController = { handler: healthEffectsHandler } // ''

export { healthEffectsController, healthEffectsHandler } // ''
