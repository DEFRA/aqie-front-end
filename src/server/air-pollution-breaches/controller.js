import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { english } from '../data/en/en.js'
import { AIR_POLLUTION_BREACHES_PATH_EN } from '../data/constants.js'
import { breachesContentEn } from './content.js'
import { fetchBreaches } from './fetch-breaches.js'

const EN_PATH = AIR_POLLUTION_BREACHES_PATH_EN

function mapActiveBreaches(activeBreaches, activeContent) {
  return activeBreaches.map((breach) => ({
    ...breach,
    pollutantLinkText: `${activeContent.whatCausesPrefix}${breach.pollutantName}${activeContent.whatCausesSuffix}`
  }))
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
          ${breach.pollutantName} (<a href="${breach.pollutantLink}" class="govuk-link">${activeContent.whatCausesPrefix}${breach.pollutantName}${activeContent.whatCausesSuffix}</a>)
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

function getViewModel(
  content,
  activeBreaches,
  pastBreaches,
  currentPath,
  request,
  sharedContent
) {
  return {
    pageTitle: content.pageTitle,
    heading: content.heading,
    intro: content.intro,
    active: {
      ...content.active,
      countHtml: content.active.countMessage.replace(
        '{count}',
        String(activeBreaches.length)
      )
    },
    past: content.past,
    activeBreaches: mapActiveBreaches(activeBreaches, content.active),
    pastBreaches,
    pastAccordionItems: mapPastBreachesToAccordionItems(pastBreaches, content),
    currentPath,
    metaSiteUrl: getAirQualitySiteUrl(request),
    phaseBanner: sharedContent.phaseBanner,
    footerTxt: sharedContent.footerTxt,
    cookieBanner: sharedContent.cookieBanner,
    serviceName: sharedContent.multipleLocations.serviceName,
    displayBacklink: false,
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
