import { createLogger } from '../../../common/helpers/logging/logger.js'

// Create a logger instance ''
const logger = createLogger()

const handleNotifyRequest = (request, h, content) => {
  logger.info('Starting notify journey')

  // Set the journey start in session
  request.yar.set('notifyJourney', 'started')

  const viewModel = {
    ...content,
    pageTitle: 'What is your mobile phone number? - Check air quality',
    heading: 'What is your mobile phone number?',
    serviceName: 'Check air quality',
    formData: request.yar.get('formData') || {}
  }

  return h.view('notify/register/sms-alerts/index', viewModel)
}

const handleNotifyPost = (request, h) => {
  const { notifyByText } = request.payload

  // Basic validation
  if (!notifyByText || notifyByText.trim() === '') {
    const viewModel = {
      pageTitle: 'What is your mobile phone number? - Check air quality',
      heading: 'What is your mobile phone number?',
      serviceName: 'Check air quality',
      error: {
        message: 'Enter your mobile phone number',
        field: 'notifyByText'
      },
      formData: request.payload
    }

    return h.view('notify/register/sms-alerts/index', viewModel)
  }

  // Store the mobile number in session
  request.yar.set('mobileNumber', notifyByText)

  // Redirect to verification step (placeholder)
  return h.redirect('/notify/register/sms-alerts/verify-code')
}

export { handleNotifyRequest, handleNotifyPost }
