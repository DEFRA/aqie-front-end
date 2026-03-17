import { english } from '../data/en/en.js'
import { LANG_CY, LANG_EN, REDIRECT_STATUS_CODE } from '../data/constants.js'
import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const sulphurDioxideController = {
  handler: (request, h) => {
    const { sulphurDioxide } = english.pollutants
    const { footerTxt, cookieBanner, phaseBanner, multipleLocations } = english
    const { query } = request
    const metaSiteUrl = getAirQualitySiteUrl(request)

    const lang = LANG_EN
    if (query?.lang && query?.lang === LANG_CY) {
      return h
        .redirect(`/llygryddion/sylffwr-deuocsid/cy?lang=cy`)
        .code(REDIRECT_STATUS_CODE)
    }

    logger.info('AuditLog20-Pollutant Info Viewed - Sulphur Dioxide (SO2)')

    return h.view('sulphur-dioxide/index', {
      pageTitle: sulphurDioxide.pageTitle,
      description: sulphurDioxide.description,
      metaSiteUrl,
      sulphurDioxide,
      page: 'Sulphur dioxide (SO₂)',
      displayBacklink: false,
      phaseBanner,
      footerTxt,
      cookieBanner,
      serviceName: multipleLocations.serviceName,
      currentPath: '/pollutants/sulphur-dioxide',
      lang: query.lang ?? lang
    })
  }
}

export { sulphurDioxideController }
