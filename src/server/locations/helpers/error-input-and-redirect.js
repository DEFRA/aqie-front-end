import { english } from '../../data/en/en.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  handleNoSearchTerms,
  handleSearchTerms
} from './handle-error-helpers.js'
import {
  STATUS_INTERNAL_SERVER_ERROR,
  STATUS_UNAUTHORIZED
} from '../../data/constants.js'

const logger = createLogger()

/**
 * Main function to handle error input and redirect.
 */
const handleErrorInputAndRedirect = (
  request,
  h,
  lang,
  payload,
  searchTerms
) => {
  try {
    if (!searchTerms) {
      return handleNoSearchTerms(request, h, lang, payload)
    }

    return handleSearchTerms(searchTerms)
  } catch (error) {
    logger.error(`Error in handleErrorInputAndRedirect: ${error.message}`)
    return h.view('error/index', {
      pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
      footerTxt: english.footerTxt,
      url: request.path,
      phaseBanner: english.phaseBanner,
      statusCode: error.message.includes('access_token')
        ? STATUS_UNAUTHORIZED
        : STATUS_INTERNAL_SERVER_ERROR,
      cookieBanner: english.cookieBanner,
      serviceName: english.multipleLocations.serviceName,
      notFoundUrl: english.notFoundUrl,
      lang
    })
  }
}

export { handleErrorInputAndRedirect }
