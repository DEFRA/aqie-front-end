// ''
import { STATUS_OK } from '../data/constants.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const loadingStatusController = {
  handler: (request, h) => {
    const niProcessing = request.yar?.get('niProcessing')
    const niError = request.yar?.get('niError')
    const redirectTo = request.yar?.get('niRedirectTo')
    const lang = request.yar?.get('lang') || 'en'
    const postcode = request.yar?.get('niPostcode') || ''

    logger.info(
      `[LOADING STATUS] Poll check: niProcessing=${niProcessing}, niError=${niError}, redirectTo=${redirectTo}, lang=${lang}, postcode=${postcode}`
    )

    // '' Check if processing is complete
    if (!niProcessing) {
      if (niError) {
        // '' Failed - redirect to retry page
        const postcode = request.yar?.get('niPostcode') || ''
        const lang = request.yar?.get('lang') || 'en'
        logger.info(
          `[LOADING STATUS] Returning FAILED status with retry redirect`
        )
        return h
          .response({
            status: 'failed',
            redirectTo: `/retry?postcode=${encodeURIComponent(postcode)}&lang=${lang}`
          })
          .code(STATUS_OK)
      }

      if (redirectTo) {
        // '' Success - redirect to results
        logger.info(
          `[LOADING STATUS] Returning COMPLETE status with redirectTo=${redirectTo}`
        )
        return h
          .response({
            status: 'complete',
            redirectTo
          })
          .code(STATUS_OK)
      }

      // '' No active processing, redirect to search
      logger.warn(
        `[LOADING STATUS] No processing and no redirectTo - returning FAILED with search redirect`
      )
      return h
        .response({
          status: 'failed',
          redirectTo: '/search-location'
        })
        .code(STATUS_OK)
    }

    // '' Still processing
    logger.info(`[LOADING STATUS] Still processing...`)
    return h
      .response({
        status: 'processing'
      })
      .code(STATUS_OK)
  }
}

export { loadingStatusController }
