import { english } from '../../data/en/en.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { handleUKError } from './error-input-and-redirect-helpers.js'
import {
  handleNoSearchTerms,
  handleSearchTerms
} from './handle-error-helpers.js'
import {
  STATUS_INTERNAL_SERVER_ERROR,
  STATUS_UNAUTHORIZED
} from '../../data/constants.js'

// '' Accept logger as an optional parameter for testability
const handleErrorInputAndRedirect = (
  request,
  h,
  lang,
  payload,
  searchTerms,
  logger = createLogger() // '' Default to real logger if not provided
) => {
  try {
    if (!searchTerms) {
      return handleNoSearchTerms(request, h, lang, payload)
    }
    const result = handleSearchTerms(searchTerms)
    if (result?.invalidInput) {
      return handleUKError(
        request,
        h,
        lang,
        result.locationNameOrPostcode || searchTerms
      )
    }
    return result
  } catch (error) {
    logger.error(`Error in handleErrorInputAndRedirect: ${error?.message}`)
    return h.view('error/index', {
      pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
      footerTxt: english.footerTxt,
      url: request.path,
      phaseBanner: english.phaseBanner,
      statusCode: error?.message?.includes('access_token')
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
