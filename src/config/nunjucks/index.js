import path, { dirname } from 'node:path'
import nunjucks from 'nunjucks'
import hapiVision from '@hapi/vision'
import { fileURLToPath } from 'node:url'

import { config } from '../index.js'
import { context } from './context/context.js'
import {
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh,
  addDaysToTodayFull,
  addDaysToTodayFullWelsh
} from './filters/index.js'
import * as globals from './globals/globals.js'
import * as filters from './filters/index.js'
import { createLogger } from '../../server/common/helpers/logging/logger.js'
import { addToSentenceCase } from './filters/format-sentence.js'

const logger = createLogger('nunjucks')

const currentDir = dirname(fileURLToPath(import.meta.url))
const nunjucksEnvironment = nunjucks.configure(
  [
    'node_modules/govuk-frontend/dist/',
    path.resolve(currentDir, '../../node_modules/govuk-frontend/dist/'),
    path.resolve(currentDir, '../../server/common/templates'),
    path.resolve(currentDir, '../../server/common/components'),
    path.resolve(currentDir, '../../server/common/components/footer'),
    path.resolve(currentDir, '../../server/common/templates/partials'),
    path.resolve(currentDir, '../../server/common/templates/macros'),
    path.resolve(currentDir, '../../server/home/partials'),
    path.resolve(currentDir, '../../server/home'),
    path.resolve(currentDir, '../../server/check-local-air-quality/partials'),
    path.resolve(currentDir, '../../server/common/templates/partials'),
    path.resolve(currentDir, '../../server/common/templates/partials/daqi'),
    path.resolve(currentDir, '../../server/common/templates/macros/attributes'),
    path.resolve(currentDir, '../../server/common/templates/macros/logo'),
    path.resolve(currentDir, '../../server/cookies/partials'),
    path.resolve(currentDir, '../../server/accessibility/partials'),
    path.resolve(
      currentDir,
      '../../server/common/templates/partials/pollutants'
    ),
    path.resolve(currentDir, '../../server/error/partials'),
    path.resolve(
      currentDir,
      '../../node_modules/govuk-frontend/dist/govuk/components/cookie-banner/'
    )
  ],
  {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: true,
    lstripBlocks: true,
    watch: config.get('nunjucks.watch'),
    noCache: config.get('nunjucks.noCache')
  }
)

export const nunjucksConfig = {
  plugin: hapiVision,
  options: {
    engines: {
      njk: {
        compile(src, options) {
          const template = nunjucks.compile(src, options.environment)
          return (ctx) => template.render(ctx)
        }
      }
    },
    compileOptions: {
      environment: nunjucksEnvironment
    },
    relativeTo: path.resolve(currentDir, '../..'),
    path: 'server',
    isCached: config.get('isProduction'),
    context
  }
}

for (const [name, global] of Object.entries(globals)) {
  nunjucksEnvironment.addGlobal(name, global)
}

for (const [name, filter] of Object.entries(filters)) {
  nunjucksEnvironment.addFilter(name, filter)
}

nunjucksEnvironment.addFilter('minusOneHour', function (date) {
  const newDate = new Date(date)
  newDate.setHours(newDate.getHours() - 1)
  return newDate
})

nunjucksEnvironment.addFilter('date', function (date, _format) {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return 'Invalid date'
  }
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date))
})

// Register filters with debug logging
try {
  addDaysToTodayAbrev(nunjucksEnvironment)
  addDaysToTodayAbrevWelsh(nunjucksEnvironment)
  addDaysToTodayFull(nunjucksEnvironment)
  addDaysToTodayFullWelsh(nunjucksEnvironment)
  addToSentenceCase(nunjucksEnvironment)
  logger.info('Filters registered successfully.')
} catch (error) {
  logger.error('Error registering filters:', error)
}
