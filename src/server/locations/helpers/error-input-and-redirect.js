import { getAirQuality } from '~/src/server/data/en/air-quality.js'
import { english } from '~/src/server/data/en/en.js'
import { welsh } from '~/src/server/data/cy/cy.js'
import { getLocationNameOrPostcode } from '~/src/server/locations/helpers/location-type-util'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import {
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LANG_EN,
  LANG_CY
} from '~/src/server/data/constants'
import {
  isValidFullPostcodeUK,
  isValidPartialPostcodeUK,
  isWordsOnly,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI
} from '~/src/server/locations/helpers/convert-string'

const logger = createLogger()

const handleErrorInputAndRedirect = (
  request,
  h,
  lang,
  payload,
  searchTerms
) => {
  if (!searchTerms) {
    /* eslint-disable camelcase */
    const tempString = request?.headers?.referer?.split('/')[3]
    const str = tempString?.split('?')[0]

    const { searchLocation, footerTxt, phaseBanner, cookieBanner } = english
    let locationType = request?.payload?.locationType
    const airQuality = getAirQuality(request.payload?.aq, 2, 4, 5, 7)
    let locationNameOrPostcode = getLocationNameOrPostcode(
      locationType,
      payload
    )

    if (
      !locationType &&
      str !== 'search-location' &&
      str !== 'chwilio-lleoliad'
    ) {
      locationType = request.yar.get('locationType')
      locationNameOrPostcode = request.yar.get('locationNameOrPostcode')
    } else {
      request.yar.set('locationType', locationType)
      request.yar.set('locationNameOrPostcode', locationNameOrPostcode)
      request.yar.set('airQuality', airQuality)
    }
    if (!locationNameOrPostcode && !locationType) {
      request.yar.set('errors', {
        errors: {
          titleText:
            lang === LANG_EN
              ? searchLocation.errorText.radios.title
              : welsh.searchLocation.errorText.radios.title,
          errorList: [
            {
              text:
                lang === LANG_EN
                  ? searchLocation.errorText.radios.list.text
                  : welsh.searchLocation.errorText.radios.list.text,
              href: '#locationType'
            }
          ]
        }
      })
      request.yar.set('errorMessage', {
        errorMessage: {
          text:
            lang === LANG_EN
              ? searchLocation.errorText.radios.list.text
              : welsh.searchLocation.errorText.radios.list.text
        }
      })

      request.yar.set('locationType', '')
      request.yar.get('', '')

      if (lang === LANG_CY) {
        return h.redirect(`chwilio-lleoliad/cy?lang=cy`).takeover()
      }
      if (str === 'search-location') {
        return h.redirect(`/search-location?lang=en`).takeover()
      }
      return null
    }

    try {
      let userLocation = locationNameOrPostcode.toUpperCase() // Use 'let' to allow reassignment
      // Regex patterns to check for full and partial postcodes
      const fullPostcodePattern = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/
      // Insert a space for full postcodes without a space
      if (
        fullPostcodePattern.test(userLocation) &&
        !userLocation.includes(' ')
      ) {
        const spaceIndex = userLocation.length - 3
        userLocation = `${userLocation.slice(0, spaceIndex)} ${userLocation.slice(
          spaceIndex
        )}`
      }

      if (!userLocation && locationType === LOCATION_TYPE_UK) {
        request.yar.set('errors', {
          errors: {
            titleText:
              lang === LANG_EN
                ? searchLocation.errorText.uk.fields.title
                : welsh.searchLocation.errorText.uk.fields.title,
            errorList: [
              {
                text:
                  lang === LANG_EN
                    ? searchLocation.errorText.uk.fields.list.text
                    : welsh.searchLocation.errorText.uk.fields.list.text,
                href: '#engScoWal'
              }
            ]
          }
        })
        request.yar.set('errorMessage', {
          errorMessage: {
            text:
              lang === LANG_EN
                ? searchLocation.errorText.uk.fields.list.text
                : welsh.searchLocation.errorText.uk.fields.list.text
          }
        })
        request.yar.set('locationType', LOCATION_TYPE_UK)
        request.yar.set('locationNameOrPostcode', 'locationNameOrPostcode')

        return lang === LANG_EN
          ? h.redirect(`/search-location?lang=en`).takeover()
          : h.redirect(`chwilio-lleoliad/cy?lang=cy`).takeover()
      }
      if (!userLocation && locationType === LOCATION_TYPE_NI) {
        request.yar.set('errors', {
          errors: {
            titleText:
              lang === LANG_EN
                ? searchLocation.errorText.ni.fields.title
                : welsh.searchLocation.errorText.ni.fields.title, // 'There is a problem',
            errorList: [
              {
                text:
                  lang === LANG_EN
                    ? searchLocation.errorText.ni.fields.list.text
                    : welsh.searchLocation.errorText.ni.fields.list.text, // 'Enter a postcode',
                href: '#ni'
              }
            ]
          }
        })
        request.yar.set('errorMessage', {
          errorMessage: {
            text:
              lang === LANG_EN
                ? searchLocation.errorText.ni.fields.list.text
                : welsh.searchLocation.errorText.ni.fields.list.text // 'Enter a postcode'
          }
        })
        request.yar.set('locationType', LOCATION_TYPE_NI)
        request.yar.set('locationNameOrPostcode', 'locationNameOrPostcode')
        return lang === LANG_EN
          ? h.redirect(`/search-location?lang=en`).takeover()
          : h.redirect(`chwilio-lleoliad/cy?lang=cy`).takeover()
      }
      locationType = request.yar.get('locationType')
      return { locationType, userLocation, locationNameOrPostcode }
    } catch (error) {
      logger.error(
        `error from location refresh outside fetch APIs: ${error.message}`
      )
      let statusCode = 500
      if (
        error.message ===
        "Cannot read properties of undefined (reading 'access_token')"
      ) {
        statusCode = 401
      }
      return h.view('error/index', {
        pageTitle: english.notFoundUrl.serviceAPI.pageTitle,
        footerTxt,
        url: request.path,
        phaseBanner,
        displayBacklink: false,
        cookieBanner,
        serviceName: english.multipleLocations.serviceName,
        notFoundUrl: english.notFoundUrl,
        statusCode,
        lang
      })
    }
  }
  if (
    (searchTerms && isWordsOnly(searchTerms)) ||
    isValidFullPostcodeUK(searchTerms) ||
    isValidPartialPostcodeUK(searchTerms)
  ) {
    return {
      locationType: 'uk-location',
      userLocation: searchTerms,
      locationNameOrPostcode: searchTerms
    }
  }
  if (
    (searchTerms && !isWordsOnly(searchTerms)) ||
    isValidFullPostcodeNI(searchTerms) ||
    !isValidPartialPostcodeNI(searchTerms)
  ) {
    return {
      locationType: 'ni-location',
      userLocation: searchTerms,
      locationNameOrPostcode: searchTerms
    }
  }
  return {
    locationType: 'uk-location',
    userLocation: searchTerms,
    locationNameOrPostcode: searchTerms
  }
}

export { handleErrorInputAndRedirect }
