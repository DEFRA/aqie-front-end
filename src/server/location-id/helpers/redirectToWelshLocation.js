import { LANG_CY } from '../data/constants.js'

const redirectToWelshLocation = (query, locationId, h) => {
  if (query?.lang === LANG_CY && !query?.searchTerms && locationId) {
    return h.redirect(`/lleoliad/${locationId}/?lang=cy`).code(301)
  }
  return null
}

export default redirectToWelshLocation
