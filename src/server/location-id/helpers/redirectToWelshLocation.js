import { LANG_CY } from '~/src/server/data/constants'

const redirectToWelshLocation = (query, locationId, h) => {
  if (query?.lang === LANG_CY && !query?.searchTerms && locationId) {
    return h.redirect(`/lleoliad/${locationId}/?lang=cy`)
  }
  return null
}

export default redirectToWelshLocation
