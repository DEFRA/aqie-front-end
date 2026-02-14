// ''
import { STATUS_OK } from '../data/constants.js'

const loadingStatusController = {
  handler: (request, h) => {
    const niProcessing = request.yar?.get('niProcessing')
    const niError = request.yar?.get('niError')
    const redirectTo = request.yar?.get('niRedirectTo')

    // '' Check if processing is complete
    if (!niProcessing) {
      if (niError) {
        // '' Failed - redirect to retry page
        const postcode = request.yar?.get('niPostcode') || ''
        const lang = request.yar?.get('lang') || 'en'
        return h
          .response({
            status: 'failed',
            redirectTo: `/retry?postcode=${encodeURIComponent(postcode)}&lang=${lang}`
          })
          .code(STATUS_OK)
      }

      if (redirectTo) {
        // '' Success - redirect to results
        return h
          .response({
            status: 'complete',
            redirectTo
          })
          .code(STATUS_OK)
      }

      // '' No active processing, redirect to search
      return h
        .response({
          status: 'failed',
          redirectTo: '/search-location'
        })
        .code(STATUS_OK)
    }

    // '' Still processing
    return h
      .response({
        status: 'processing'
      })
      .code(STATUS_OK)
  }
}

export { loadingStatusController }
