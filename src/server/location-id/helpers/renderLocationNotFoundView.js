import { LOCATION_NOT_FOUND } from '../../data/constants.js' // Updated import to use relative path

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
