import { LANG_CY, REDIRECT_STATUS_CODE } from '../../data/constants.js'

const redirectToWelshLocation = (query, locationId, h) => {
  if (query?.lang === LANG_CY && !query?.searchTerms && locationId) {
    return h
      .redirect(`/lleoliad/${locationId}/?lang=cy`)
      .code(REDIRECT_STATUS_CODE)
  }
  return null
}

export default redirectToWelshLocation
