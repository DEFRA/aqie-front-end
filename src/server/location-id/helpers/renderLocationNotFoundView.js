import { LOCATION_NOT_FOUND } from '~/src/server/data/constants'

const renderLocationNotFoundView = (notFoundLocation, english, lang, h) => {
  return h.view(LOCATION_NOT_FOUND, {
    paragraph: notFoundLocation.paragraphs,
    serviceName: notFoundLocation.heading,
    footerTxt: english.footerTxt,
    phaseBanner: english.phaseBanner,
    backlink: english.backlink,
    cookieBanner: english.cookieBanner,
    lang
  })
}

export default renderLocationNotFoundView
