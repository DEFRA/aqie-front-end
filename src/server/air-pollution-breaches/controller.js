import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { english } from '../data/en/en.js'
import { AIR_POLLUTION_BREACHES_PATH_EN } from '../data/constants.js'
import { breachesContentEn } from './content.js'
import { fetchBreaches, groupActiveByRegion } from './fetch-breaches.js'
import { formatUKPostcode } from '../locations/helpers/convert-string.js'

const EN_PATH = AIR_POLLUTION_BREACHES_PATH_EN

function mapActiveBreaches(activeBreaches, activeContent) {
  return activeBreaches.map((breach) => {
    const nameLower =
      breach.pollutantName.charAt(0).toLowerCase() +
      breach.pollutantName.slice(1)
    return {
      ...breach,
      pollutantLinkText: `${activeContent.whatCausesPrefix}${nameLower}${activeContent.whatCausesSuffix}`
    }
  })
}

function buildPastBreachHtml(breach, content) {
  const pastContent = content.past
  const activeContent = content.active
  return `
    <dl class="govuk-summary-list govuk-!-margin-bottom-0">
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">${pastContent.labels.alertRegion}</dt>
        <dd class="govuk-summary-list__value">${breach.alertRegion}</dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">${pastContent.labels.monitoringArea}</dt>
        <dd class="govuk-summary-list__value">${breach.monitoringArea}</dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">${pastContent.labels.pollutant}</dt>
        <dd class="govuk-summary-list__value">
          ${breach.pollutantName} (<a href="${breach.pollutantLink}" class="govuk-link">${activeContent.whatCausesPrefix}${breach.pollutantNameLower}${activeContent.whatCausesSuffix}</a>)
        </dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">${pastContent.labels.dataSource}</dt>
        <dd class="govuk-summary-list__value">${breach.dataSource}</dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">${pastContent.labels.alertPeriod}</dt>
        <dd class="govuk-summary-list__value">
          ${pastContent.fromPrefix} ${breach.alertPeriodFrom}<br>
          ${pastContent.toPrefix} ${breach.alertPeriodTo}
        </dd>
      </div>
    </dl>
  `
}

function mapPastBreachesToAccordionItems(pastBreaches, content) {
  return pastBreaches.map((breach) => ({
    heading: {
      text: breach.title
    },
    content: {
      html: buildPastBreachHtml(breach, content)
    }
  }))
}

function getLocationName(query) {
  if (Array.isArray(query?.locationName)) {
    return query.locationName[0] || ''
  }
  return query?.locationName || ''
}

function getLocationContext(query = {}) {
  const searchTerms = query?.searchTerms || ''
  const locationName = getLocationName(query)
  return {
    searchTerms,
    locationName,
    hasLocationName: locationName.trim() !== ''
  }
}

function buildBackLinkText(
  formattedPostcode,
  locationName,
  hasLocationName,
  defaultText
) {
  if (formattedPostcode && hasLocationName) {
    return `Air pollution in ${formattedPostcode}, ${locationName}`
  }
  if (formattedPostcode) {
    return `Air pollution in ${formattedPostcode}`
  }
  if (hasLocationName) {
    return `Air pollution in ${locationName}`
  }
  return defaultText
}

function buildBackLinkData({
  locationId,
  searchTerms,
  locationName,
  backlink
}) {
  if (locationId) {
    const formattedPostcode = searchTerms.trim()
      ? formatUKPostcode(searchTerms)
      : ''
    return {
      backLinkText: buildBackLinkText(
        formattedPostcode,
        locationName,
        locationName.trim() !== '',
        backlink.text
      ),
      backLinkUrl: `/location/${locationId}?lang=en`
    }
  }
  return {
    backLinkText: backlink.text,
    backLinkUrl: '/search-location?lang=en'
  }
}

function buildLocationLinks(
  locationId,
  locationName,
  searchTerms,
  activeBreaches,
  pastBreaches
) {
  const actionsLink = locationId
    ? `/location/${locationId}/actions-reduce-exposure?lang=en`
    : '#'

  const locationQuerySuffix = [
    locationId ? `locationId=${encodeURIComponent(locationId)}` : '',
    locationName ? `locationName=${encodeURIComponent(locationName)}` : '',
    searchTerms ? `searchTerms=${encodeURIComponent(searchTerms)}` : ''
  ]
    .filter(Boolean)
    .join('&')

  const appendLocationSuffix = (breach) => ({
    ...breach,
    pollutantLink: locationQuerySuffix
      ? `${breach.pollutantLink}&${locationQuerySuffix}`
      : breach.pollutantLink
  })

  const processedActiveBreaches = activeBreaches.map(appendLocationSuffix)

  const processedPastBreaches = pastBreaches.map((breach) => ({
    ...appendLocationSuffix(breach),
    pollutantNameLower:
      breach.pollutantName.charAt(0).toLowerCase() +
      breach.pollutantName.slice(1)
  }))

  return { actionsLink, processedActiveBreaches, processedPastBreaches }
}

function getViewModel(
  content,
  activeBreaches,
  pastBreaches,
  currentPath,
  request,
  sharedContent
) {
  const { locationId } = request.query
  const { searchTerms, locationName, hasLocationName } = getLocationContext(
    request.query
  )
  const { backlink } = sharedContent
  const { backLinkText, backLinkUrl } = buildBackLinkData({
    locationId,
    searchTerms,
    locationName,
    backlink
  })

  const mappedActiveBreaches = mapActiveBreaches(activeBreaches, content.active)

  const { actionsLink, processedActiveBreaches, processedPastBreaches } =
    buildLocationLinks(
      locationId,
      locationName,
      searchTerms,
      mappedActiveBreaches,
      pastBreaches
    )

  return {
    pageTitle: content.pageTitle,
    heading: content.heading,
    intro: {
      ...content.intro,
      actions: content.intro.actions.replace('{actionsLink}', actionsLink)
    },
    active: {
      ...content.active,
      countHtml: content.active.countMessage.replace(
        '{count}',
        String(activeBreaches.length)
      )
    },
    past: content.past,
    activeBreaches: processedActiveBreaches,
    activeBreachRegions: groupActiveByRegion(processedActiveBreaches),
    pastBreaches: processedPastBreaches,
    pastAccordionItems: mapPastBreachesToAccordionItems(
      processedPastBreaches,
      content
    ),
    currentPath,
    metaSiteUrl: getAirQualitySiteUrl(request),
    phaseBanner: sharedContent.phaseBanner,
    footerTxt: sharedContent.footerTxt,
    cookieBanner: sharedContent.cookieBanner,
    serviceName: sharedContent.multipleLocations.serviceName,
    backlink,
    displayBacklink: !!locationId,
    customBackLink: !!locationId,
    backLinkText,
    backLinkUrl,
    locationName,
    locationId,
    hasLocationName,
    hideLanguageToggle: true
  }
}

function shouldSwitchToLanguage(request, targetLanguage) {
  const { lang } = request.query
  return lang && lang !== targetLanguage
}

const airPollutionBreachesController = {
  handler: async (request, h) => {
    if (shouldSwitchToLanguage(request, 'en')) {
      return h.redirect(EN_PATH)
    }

    const { activeBreaches, pastBreaches } = await fetchBreaches('en', request)

    const viewModel = getViewModel(
      breachesContentEn,
      activeBreaches,
      pastBreaches,
      EN_PATH,
      request,
      english
    )

    return h.view('air-pollution-breaches/index', {
      ...viewModel,
      page: 'air pollution breaches',
      lang: 'en'
    })
  }
}

const airPollutionBreachesCyController = {
  handler: (_request, h) => {
    return h.redirect(EN_PATH)
  }
}

export { airPollutionBreachesController, airPollutionBreachesCyController }
