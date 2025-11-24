// '' Health effects controller (EN)
import { english } from '../data/en/en.js' // '' English copy
import { welsh } from '../data/cy/cy.js' // '' Welsh copy for redirect
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js' // '' Site URL helper
import { createLogger } from '../common/helpers/logging/logger.js' // '' Logger
import {
  getReadableLocationName,
  buildHealthEffectsViewModel
} from './helpers/index.js' // '' Extracted helpers

const LANG_EN = 'en' // '' Language constants
const LANG_CY = 'cy'
const REDIRECT_STATUS_CODE = 302

const logger = createLogger() // '' Logger instance

// '' Handler (EN)
const healthEffectsHandler = (request, h, content = english) => {
  try {
    const { query, params } = request
    const metaSiteUrl = getAirQualitySiteUrl(request) // '' Build canonical site URL

    // '' Optional redirect to Welsh variant
    if ((query?.lang || '').toLowerCase() === LANG_CY) {
      const readableNameRedirect = getReadableLocationName(query, params, logger)
      const redirectUrl = readableNameRedirect
        ? `/effeithiau-iechyd/cy?lang=cy&locationName=${encodeURIComponent(readableNameRedirect)}`
        : `/effeithiau-iechyd/cy?lang=cy`
      logger.debug({ redirectUrl }, "'' Redirecting to Welsh health effects")
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    const readableName = getReadableLocationName(query, params, logger)
    const viewModel = buildHealthEffectsViewModel({
      content,
      metaSiteUrl,
      readableName,
      lang: (query.lang || LANG_EN)
    })

    logger.debug(
      {
        routePath: request.path,
        readableName,
        backLinkUrl: viewModel.backLinkUrl
      },
      "'' Rendering health-effects EN"
    )

    return h.view('health-effects/index', viewModel)
  } catch (err) {
    logger.error(err, "'' Failed to render health-effects EN")
    return h.response('Internal Server Error').code(500)
  }
}

const healthEffectsController = { handler: healthEffectsHandler } // '' Export

export { healthEffectsController, healthEffectsHandler }