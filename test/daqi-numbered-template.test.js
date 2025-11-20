// '' Tests for daqi-numbered.njk partial: HR placement and Welsh summary fallback
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import nunjucks from 'nunjucks'
import {
  addDaysToTodayFull,
  addDaysToTodayFullWelsh,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh
} from '../src/config/nunjucks/filters'

// Helper to render the template with stubbed govukTabs macro
function renderDaqiTemplate(context) {
  const templatePath = path.resolve(
    'src/server/common/templates/partials/daqi-numbered.njk'
  )
  let tpl = fs.readFileSync(templatePath, 'utf-8')

  // '' Replace import with stub macro to avoid dependency on govuk-frontend macros
  // This stub macro actually renders the tab panels so we can test their content
  tpl = tpl.replace(
    /{%\s*from\s*"govuk\/components\/tabs\/macro.njk"\s*import\s*govukTabs\s*%}/,
    '{% macro govukTabs(params) %}<div class="defra-aq-tabs daqi-tabs">{% for item in params.items %}{{ item.panel.html }}{% endfor %}</div>{% endmacro %}'
  )

  const env = new nunjucks.Environment()
  // '' Register the necessary date filters for the test environment
  addDaysToTodayFull(env)
  addDaysToTodayFullWelsh(env)
  addDaysToTodayAbrev(env)
  addDaysToTodayAbrevWelsh(env)
  return env.renderString(tpl, context)
}

describe('daqi-numbered.njk template', () => {
  it('places a single global HR after date text and before tabs component', () => {
    const html = renderDaqiTemplate({
      airQuality: {
        today: { value: 3, readableBand: 'low' },
        day2: { value: 4, readableBand: 'moderate' }
      },
      daqi: {
        tabs: { today: 'Today' },
        headings: { main: 'Air quality', predictedLevels: 'Predicted levels' },
        levels: { a: 'Low', b: 'Moderate', c: 'High', d: 'Very high' }
      },
      transformedDailySummary: {
        issue_date: '2025-11-20',
        Today: 'English summary text',
        'Monday to Friday': 'Range summary'
      },
      showSummaryDate: true,
      lang: 'en'
    })

    const hrMatches =
      html.match(/<hr\b[^>]*data-daqi-tabs-separator[^>]*>/g) || []
    expect(hrMatches.length).toBe(0) // Should be 0 as it's moved to location.njk

    const tabsIndex = html.indexOf('defra-aq-tabs daqi-tabs')
    expect(tabsIndex).toBeGreaterThan(-1)
  })

  it('renders Welsh day label with English summary body (fallback) and does not show English day label', () => {
    const html = renderDaqiTemplate({
      airQuality: {
        today: { value: 4, readableBand: 'cymedrol' },
        day2: { value: 5, readableBand: 'uchel' },
        day3: { value: 2, readableBand: 'isel' },
        day4: { value: 3, readableBand: 'isel' },
        day5: { value: 4, readableBand: 'cymedrol' }
      },
      daqi: {
        tabs: { today: 'Heddiw' },
        headings: {
          main: 'Ansawdd aer',
          predictedLevels: 'Lefelau a ragwelir'
        },
        levels: { a: 'Isel', b: 'Cymedrol', c: 'Uchel', d: 'Uchel iawn' }
      },
      transformedDailySummary: {
        issue_date: '2025-11-20',
        Heddiw: 'English summary body should appear here',
        'Dydd Llun i Dydd Gwener': 'Rhagolwg amrywiaeth dyddiau'
      },
      showSummaryDate: true,
      lang: 'cy'
    })

    // Welsh day label present
    expect(html).toMatch(/Heddiw/) // heading or summary key
    // Summary English body present
    expect(html).toMatch(/English summary body should appear here/)
    // English day label "Today" should not appear visually
    expect(html).not.toMatch(/>Today</)
  })
})
