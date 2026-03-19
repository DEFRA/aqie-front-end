import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { config } from '../../../../config/index.js'
import {
  getConfirmDetailsContext,
  logConfirmDetailsRenderError,
  consumeDuplicateAlertState,
  getConfirmDetailsSessionData,
  logConfirmDetailsSessionData,
  redirectForMissingLocation,
  buildConfirmDetailsViewModel
} from './controller-helpers.js'
import {
  getAlertSetupSessionData,
  logAlertSetupSessionData,
  logMissingAlertSetupSessionData,
  handleSetupAlertFailure
} from './controller-post-helpers.js'

// Create a logger instance ''
const logger = createLogger()

const handleConfirmAlertDetailsRequest = (request, h, content = english) => {
  logger.info('Showing confirm alert details page')

  try {
    const { lang, languageContent, smsConfirmDetails, common, metaSiteUrl } =
      getConfirmDetailsContext(request, content)

    const { duplicateAlertError, duplicateAlertLocation } =
      consumeDuplicateAlertState(request)
    const sessionData = getConfirmDetailsSessionData(request)
    const { mobileNumber, location, locationId, lat, long } = sessionData

    logConfirmDetailsSessionData(request, sessionData)

    const redirectResponse = redirectForMissingLocation({
      request,
      h,
      location,
      locationId
    })
    if (redirectResponse) {
      return redirectResponse
    }

    const safeLocation = location || 'Unknown location'
    const viewModel = buildConfirmDetailsViewModel({
      request,
      lang,
      languageContent,
      smsConfirmDetails,
      common,
      metaSiteUrl,
      safeLocation,
      locationId,
      lat,
      long,
      mobileNumber,
      duplicateAlertError,
      duplicateAlertLocation
    })

    return h.view('notify/register/sms-confirm-details/index', viewModel)
  } catch (error) {
    logConfirmDetailsRenderError(request, error)
    throw error
  }
}

const handleConfirmAlertDetailsPost = async (request, h) => {
  logger.info('Processing alert confirmation')

  const { phoneNumber, location, locationId, lat, long } =
    getAlertSetupSessionData(request)

  logAlertSetupSessionData({ phoneNumber, location, locationId, lat, long })
  logMissingAlertSetupSessionData({ phoneNumber, location, lat, long })

  // Call setup-alert API with all required fields ''
  const { setupAlert } = await import('../../../common/services/notify.js')

  // Log minimal, non-sensitive metadata only
  logger.info('Submitting alert setup request', {
    locationId,
    hasCoordinates: Boolean(lat && long)
  })

  const result = await setupAlert(
    phoneNumber,
    'sms',
    location,
    locationId,
    lat,
    long,
    request
  )

  // '' Debug logging to see actual result
  logger.info('Setup alert result received', {
    ok: result.ok,
    status: result.status,
    hasBody: !!result.body,
    hasError: !!result.error,
    bodyMessage: result.body?.message,
    bodyStatusCode: result.body?.statusCode,
    bodyError: result.body?.error
  })

  if (!result.ok) {
    return handleSetupAlertFailure({
      request,
      h,
      result,
      phoneNumber,
      location
    })
  }

  logger.info('Alert setup successful', { data: result.data })

  // Store confirmation in session ''
  request.yar.set('alertDetailsConfirmed', true)

  // Redirect to success page ''
  return h.redirect(config.get('notify.smsSuccessPath'))
}

export { handleConfirmAlertDetailsRequest, handleConfirmAlertDetailsPost }
