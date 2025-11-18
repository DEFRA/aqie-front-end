''
import { describe, it, expect } from 'vitest'
import nunjucks from 'nunjucks'
import fs from 'fs'
import path from 'path'

const TPL = path.resolve(
  __dirname,
  '../src/server/common/templates/partials/daqi-numbered.njk'
)
const VIEWS_ROOT = path.resolve(__dirname, '../src/server')
const GOVUK_DIST = path.resolve(
  __dirname,
  '../node_modules/govuk-frontend/dist'
)
const COMMON_TEMPLATES = path.resolve(
  __dirname,
  '../src/server/common/templates'
)
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([VIEWS_ROOT, GOVUK_DIST, COMMON_TEMPLATES])
)

// Register filters used by templates (copied from app nunjucks configuration)
const filters = require('../src/config/nunjucks/filters/index.js')
if (filters && filters.addDaysToTodayAbrev) {
  filters.addDaysToTodayAbrev(env)
}
if (filters && filters.addDaysToTodayAbrevWelsh) {
  filters.addDaysToTodayAbrevWelsh(env)
}
if (filters && filters.addDaysToTodayFull) {
  filters.addDaysToTodayFull(env)
}
if (filters && filters.addDaysToTodayFullWelsh) {
  filters.addDaysToTodayFullWelsh(env)
}

describe('forecast partial in DAQI tabs', () => {
  it('renders DAQI numbered block and tabs structure', () => {
    const tpl = fs.readFileSync(TPL, 'utf8')
    const rendered = env.renderString(tpl, {
      days: [
        { label: 'Today', forecast: { band: 'Low', summary: 'Clear' } },
        { label: 'Tomorrow', forecast: { band: 'Moderate', summary: 'Cloudy' } }
      ],
      airQuality: {
        today: { readableBand: 'Low', value: 1, forecastSummary: 'Clear' },
        day2: { forecastSummary: 'Cloudy' },
        day3: { forecastSummary: '' },
        day4: { forecastSummary: '' },
        day5: { forecastSummary: '' }
      },
      getForecasts: null
    })

    // The DAQI numbered block should be present in the output
    expect(rendered).toContain('daqi-numbered')
    // The tabs/list structure should be present
    expect(rendered).toContain('Today')
    expect(rendered).toContain('govuk-tabs__list')
    expect(rendered).toContain('govuk-tabs__panel')
  })
})
