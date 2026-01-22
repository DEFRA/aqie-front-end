import { createLogger } from '../../../common/helpers/logging/logger.js'
import { english } from '../../../data/en/en.js'
import { LANG_EN } from '../../../data/constants.js'
import { getAirQualitySiteUrl } from '../../../common/helpers/get-site-url.js'

// Constants ''
const PAGE_HEADING = 'This alert has already been set up'

// Create a logger instance ''
const logger = createLogger()

const handleDuplicateSubscriptionRequest = (request, h, content = english) => {
  logger.info('Showing duplicate subscription page')

  // '' Ensure notificationFlow is set so when user searches again, they stay in flow
  if (!request.yar.get('notificationFlow')) {
    request.yar.set('notificationFlow', 'sms')
  }

  // '' Get location and phone number from session
  const location = request.yar.get('location') || 'this location'
  const mobileNumber = request.yar.get('mobileNumber') || ''

  // '' Mask the phone number for display
  const maskedPhoneNumber = mobileNumber
    ? mobileNumber.replace(/(\d{5})\d+(\d{3})$/, '$1 XXX $2')
    : ''

  const { footerTxt, phaseBanner, cookieBanner } = content
  const metaSiteUrl = getAirQualitySiteUrl(request)

  // '' Content structure ready for Welsh translation
  const pageContent = {
    heading: PAGE_HEADING,
    description: `You are already getting alerts for ${location} to ${maskedPhoneNumber}.`,
    searchLink: 'Search for town or postcode',
    searchText: 'to set up a different air pollution alert.'
  }

  const viewModel = {
    pageTitle: `${PAGE_HEADING} - Check air quality - GOV.UK`,
    heading: pageContent.heading,
    page: pageContent.heading,
    serviceName: 'Check air quality',
    lang: LANG_EN,
    metaSiteUrl,
    footerTxt,
    phaseBanner,
    cookieBanner,
    displayBacklink: false,
    content: pageContent,
    location,
    maskedPhoneNumber
  }

  return h.view('notify/register/sms-duplicate/index', viewModel)
}

export { handleDuplicateSubscriptionRequest }
