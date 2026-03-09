import { getAirQualitySiteUrl } from '../common/helpers/get-site-url.js'
import { english } from '../data/en/en.js'
import { welsh } from '../data/cy/cy.js'
import {
  AIR_POLLUTION_BREACHES_PATH_EN,
  AIR_POLLUTION_BREACHES_PATH_CY
} from '../data/constants.js'
import {
  activeBreachesCy,
  activeBreachesEn,
  breachesContentCy,
  breachesContentEn,
  pastBreachesCy,
  pastBreachesEn
} from './content.js'

const EN_PATH = AIR_POLLUTION_BREACHES_PATH_EN
const CY_PATH = AIR_POLLUTION_BREACHES_PATH_CY
// ''

function mapActiveBreaches(activeBreaches, activeContent) {
  return activeBreaches.map((breach) => ({
    ...breach,
    pollutantLinkText: `${activeContent.whatCausesPrefix}${breach.pollutantName}${activeContent.whatCausesSuffix}`,
    lastUpdatedLabel: `${activeContent.lastUpdatedPrefix} ${breach.lastUpdatedText}`
  }))
}

function buildPastBreachHtml(breach, pastContent) {
  if (breach.noInformation) {
    return `<p class="govuk-body">${pastContent.noInformation}</p>`
  }

  return `
    <dl class="govuk-summary-list govuk-summary-list--no-border govuk-!-margin-bottom-0">
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
          <a href="${breach.pollutantLink}" class="govuk-link">${breach.pollutantName}</a>
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

function mapPastBreachesToAccordionItems(pastBreaches, pastContent) {
  return pastBreaches.map((breach) => ({
    heading: {
      text: breach.title
    },
    content: {
      html: buildPastBreachHtml(breach, pastContent)
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
    pastAccordionItems: mapPastBreachesToAccordionItems(
      pastBreaches,
      content.past
    ),
    currentPath,
    metaSiteUrl: getAirQualitySiteUrl(request),
    phaseBanner: sharedContent.phaseBanner,
    footerTxt: sharedContent.footerTxt,
    cookieBanner: sharedContent.cookieBanner,
    serviceName: sharedContent.multipleLocations.serviceName,
    displayBacklink: false
  }
}

function shouldSwitchToLanguage(request, targetLanguage) {
  const { lang } = request.query
  return lang && lang !== targetLanguage
}

const airPollutionBreachesController = {
  handler: (request, h) => {
    if (shouldSwitchToLanguage(request, 'en')) {
      return h.redirect(EN_PATH)
    }

    const viewModel = getViewModel(
      breachesContentEn,
      activeBreachesEn,
      pastBreachesEn,
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
  handler: (request, h) => {
    if (shouldSwitchToLanguage(request, 'cy')) {
      return h.redirect(CY_PATH)
    }

    const viewModel = getViewModel(
      breachesContentCy,
      activeBreachesCy,
      pastBreachesCy,
      CY_PATH,
      request,
      welsh
    )

    return h.view('air-pollution-breaches/index', {
      ...viewModel,
      page: 'torriadau llygredd aer',
      lang: 'cy'
    })
  }
}

export { airPollutionBreachesController, airPollutionBreachesCyController }
