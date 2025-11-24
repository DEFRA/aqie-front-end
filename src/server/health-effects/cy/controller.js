// '' Health effects controller (CY)
import { welsh } from '../../data/cy/cy.js' // '' Welsh copy
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js' // '' Site URL helper
import { createLogger } from '../../common/helpers/logging/logger.js' // '' Logger
import {
  getReadableLocationName,
  buildHealthEffectsViewModel
} from '../helpers/index.js' // '' Shared pure helpers

const LANG_EN = 'en' // '' Language constants
const LANG_CY = 'cy'
const REDIRECT_STATUS_CODE = 302

const logger = createLogger() // '' Logger instance

// '' Handler (CY)
const healthEffectsHandlerCy = (request, h, content = welsh) => {
  try {
    const { query, params } = request
    const metaSiteUrl = getAirQualitySiteUrl(request) // '' Canonical site URL

    // '' Redirect to English variant if requested
    if ((query?.lang || '').toLowerCase() === LANG_EN) {
      const readableNameRedirect = getReadableLocationName(
        query,
        params,
        logger
      )
      const redirectUrl = readableNameRedirect
        ? `/health-effects?lang=en&locationName=${encodeURIComponent(readableNameRedirect)}`
        : `/health-effects?lang=en`
      logger.debug({ redirectUrl }, "'' Redirecting to English health effects")
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    const readableName = getReadableLocationName(query, params, logger)
    const viewModel = buildHealthEffectsViewModel({
      content,
      metaSiteUrl,
      readableName,
      lang: query.lang || LANG_CY
    })

    // '' Force Welsh title/backlink (helpers supply EN defaults)
    viewModel.page = 'Effaith llygredd aer ar iechyd'
    viewModel.pageTitle = 'Effaith llygredd aer ar iechyd' // '' Unconditional Welsh title
    viewModel.backLinkText = `Llygredd aer yn ${readableName || 'y lleoliad hwn'}`
    viewModel.backlink = {
      text: viewModel.backLinkText,
      href: viewModel.backLinkUrl
    }

    logger.debug(
      {
        routePath: request.path,
        readableName,
        backLinkUrl: viewModel.backLinkUrl
      },
      "'' Rendering health-effects CY"
    )

    return h.view('health-effects/cy/index', viewModel)
  } catch (err) {
    logger.error(err, "'' Failed to render health-effects CY")
    return h.response('Internal Server Error').code(500)
  }
}

const healthEffectsControllerCy = { handler: healthEffectsHandlerCy } // '' Export

export { healthEffectsControllerCy, healthEffectsHandlerCy }
