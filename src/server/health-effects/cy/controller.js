// Health effects controller (CY)
import { welsh } from '../../data/cy/cy.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { STATUS_INTERNAL_SERVER_ERROR } from '../../data/constants.js'
import {
  getReadableLocationName,
  buildHealthEffectsViewModel
} from '../helpers/index.js'

const LANG_EN = 'en'
const LANG_CY = 'cy'
const REDIRECT_STATUS_CODE = 302

const logger = createLogger()

// Handler (CY)
const healthEffectsHandlerCy = (request, h, content = welsh) => {
  try {
    const { query, params } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    // Redirect to English variant if requested
    if ((query?.lang || '').toLowerCase() === LANG_EN) {
      const readableNameRedirect = getReadableLocationName(
        query,
        params,
        logger
      )
      const redirectUrl = readableNameRedirect
        ? `/health-effects?lang=en&locationName=${encodeURIComponent(readableNameRedirect)}`
        : `/health-effects?lang=en`
      return h.redirect(redirectUrl).code(REDIRECT_STATUS_CODE)
    }

    const readableName = getReadableLocationName(query, params, logger)
    const viewModel = buildHealthEffectsViewModel({
      content,
      metaSiteUrl,
      readableName,
      lang: query.lang || LANG_CY
    })

    // Restore original context-specific back link text
    viewModel.backLinkText = `Llygredd aer yn ${readableName || 'y lleoliad hwn'}`
    viewModel.backlink = {
      text: viewModel.backLinkText,
      href: viewModel.backLinkUrl
    }

    return h.view('health-effects/cy/index', viewModel)
  } catch (err) {
    logger.error(err, "'' Failed to render health-effects CY")
    return h
      .response('Internal Server Error')
      .code(STATUS_INTERNAL_SERVER_ERROR)
  }
}

const healthEffectsControllerCy = { handler: healthEffectsHandlerCy }

export { healthEffectsControllerCy, healthEffectsHandlerCy }
