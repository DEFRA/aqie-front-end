import { english } from '../../data/en/en.js'
import { REDIRECT_STATUS_CODE, LANG_EN } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'
import { validateEmail } from '../../common/helpers/validate-email.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger('email-journey-controller')

const getEnterEmailController = {
  handler: async (request, h) => {
    const {
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner,
      emailEnterEmail,
      common
    } = english
    const metaSiteUrl = getAirQualitySiteUrl(request)

    return h.view('notify-register/email-journey/enter-email', {
      pageTitle: emailEnterEmail.pageTitle,
      metaSiteUrl,
      heading: emailEnterEmail.heading,
      description: emailEnterEmail.description,
      page: common.emailAlertsPage,
      serviceName: common.serviceName,
      lang: LANG_EN,
      footerTxt,
      phaseBanner,
      backlink,
      cookieBanner
    })
  }
}

const postEnterEmailController = {
  handler: async (request, h) => {
    const { notifyByEmail } = request.payload

    // Validate email address
    const validation = validateEmail(notifyByEmail)

    if (!validation.isValid) {
      const {
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        emailEnterEmail,
        common
      } = english
      const metaSiteUrl = getAirQualitySiteUrl(request)

      return h.view('notify-register/email-journey/enter-email', {
        pageTitle: `Error: ${emailEnterEmail.pageTitle}`,
        metaSiteUrl,
        heading: emailEnterEmail.heading,
        description: emailEnterEmail.description,
        page: common.emailAlertsPage,
        serviceName: common.serviceName,
        lang: LANG_EN,
        footerTxt,
        phaseBanner,
        backlink,
        cookieBanner,
        error: {
          text: validation.error
        },
        notifyByEmail
      })
    }

    // Store the formatted email in session
    request.yar?.set('emailAddress', validation.formatted)

    logger.info('Email validated and stored in session', {
      email: validation.formatted
    })

    return h.redirect('/notify/confirm-email').code(REDIRECT_STATUS_CODE)
  }
}

export { getEnterEmailController, postEnterEmailController }
