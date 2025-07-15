import { getAirQualityCy } from '../../data/cy/air-quality.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { welsh } from '../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND,
  REDIRECT_STATUS_CODE,
  AIR_QUALITY_THRESHOLD_1,
  AIR_QUALITY_THRESHOLD_2,
  AIR_QUALITY_THRESHOLD_3,
  AIR_QUALITY_THRESHOLD_4,
  LANG_SLICE_LENGTH
} from '../../data/constants.js'

const logger = createLogger()

function getLang(query, path) {
  let lang = query?.lang?.slice(0, LANG_SLICE_LENGTH)
  if (lang !== LANG_CY && lang !== LANG_EN && path === '/lleoliad') {
    lang = LANG_CY
  }
  return lang
}

function getLocationTypeAndName(request, str) {
  let locationType = request?.payload?.locationType
  let locationNameOrPostcode = ''
  if (locationType === LOCATION_TYPE_UK) {
    locationNameOrPostcode = request.payload.engScoWal.trim()
  } else if (locationType === LOCATION_TYPE_NI) {
    locationNameOrPostcode = request.payload.ni
  }
  if (!locationType && str !== 'chwilio-lleoliad') {
    locationType = request.yar.get('locationType')
    locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
  } else {
    request.yar.set('locationType', locationType)
    request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
  }
  return { locationType, locationNameOrPostcode }
}

function handleRedirectIfNeeded(query, h) {
  if (query?.lang && query?.lang === LANG_EN) {
    return h.redirect(`/location?lang=en`).code(REDIRECT_STATUS_CODE)
  }
  return null
}

function handleMissingLocation(
  locationNameOrPostcode,
  locationType,
  str,
  request,
  h
) {
  if (!locationNameOrPostcode && !locationType) {
    request.yar.set('locationType', '')
    if (str === 'chwilio-lleoliad') {
      return h
        .redirect(`/chwilio-lleoliad/cy?lang=cy`)
        .code(REDIRECT_STATUS_CODE)
    }
  }
  return null
}

function renderNotFoundView(
  h,
  LOCATION_NOT_FOUND,
  notFoundLocation,
  locationNameOrPostcode,
  home,
  footerTxt,
  searchLocation,
  phaseBanner,
  backlink,
  cookieBanner,
  lang,
  query
) {
  return h.view(LOCATION_NOT_FOUND, {
    userLocation: locationNameOrPostcode,
    pageTitle: `${notFoundLocation.paragraphs.a} ${locationNameOrPostcode} - ${home.pageTitle}`,
    paragraph: notFoundLocation.paragraphs,
    footerTxt,
    serviceName: searchLocation.serviceName,
    phaseBanner,
    backlink,
    cookieBanner,
    lang: query?.lang ?? lang
  })
}

function renderErrorView(
  h,
  request,
  footerTxt,
  phaseBanner,
  cookieBanner,
  welsh,
  lang
) {
  return h.view('error/index', {
    footerTxt,
    url: request.path,
    phaseBanner,
    displayBacklink: false,
    cookieBanner,
    serviceName: welsh.multipleLocations.serviceName,
    notFoundUrl: welsh.notFoundUrl,
    lang
  })
}

const getLocationDataController = {
  handler: async (request, h) => {
    const { query, path } = request
    const tempString = request?.headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]
    const lang = getLang(query, path)
    const redirect = handleRedirectIfNeeded(query, h)
    if (redirect) return redirect
    const {
      searchLocation,
      notFoundLocation,
      footerTxt,
      phaseBanner,
      backlink,
      home,
      cookieBanner
    } = welsh
    const airQuality = getAirQualityCy(
      request.payload?.aq,
      AIR_QUALITY_THRESHOLD_1,
      AIR_QUALITY_THRESHOLD_2,
      AIR_QUALITY_THRESHOLD_3,
      AIR_QUALITY_THRESHOLD_4
    )
    const { locationType, locationNameOrPostcode } = getLocationTypeAndName(
      request,
      str
    )
    if (!request.yar.get('airQuality')) {
      request.yar.set('airQuality', airQuality)
    }
    const missingLocationRedirect = handleMissingLocation(
      locationNameOrPostcode,
      locationType,
      str,
      request,
      h
    )
    if (missingLocationRedirect) return missingLocationRedirect
    try {
      return renderNotFoundView(
        h,
        LOCATION_NOT_FOUND,
        notFoundLocation,
        locationNameOrPostcode,
        home,
        footerTxt,
        searchLocation,
        phaseBanner,
        backlink,
        cookieBanner,
        lang,
        query
      )
    } catch (error) {
      logger.error(`error from location refresh ${error.message}`)
      return renderErrorView(
        h,
        request,
        footerTxt,
        phaseBanner,
        cookieBanner,
        welsh,
        lang
      )
    }
  }
}

export { getLocationDataController }
