import path from 'path'
import { fileURLToPath } from 'url'
import nunjucks from 'nunjucks'
import hapiVision from '@hapi/vision'
import { config } from '../index.js'
import { context } from './context.js'
import * as filters from './filters/index.js'
import * as globals from './globals.js'
import {
  addMomentFilters,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh,
  addToSentenceCase
} from './filters/index.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nunjucksEnvironment = nunjucks.configure(
  [
    'node_modules/govuk-frontend/dist/',
    path.normalize(
      path.resolve(
        dirname,
        '..',
        '..',
        '..',
        'node_modules',
        'govuk-frontend',
        'dist'
      )
    ),
    path.normalize(
      path.resolve(dirname, '..', '..', 'server', 'common', 'templates')
    ),
    path.normalize(
      path.resolve(dirname, '..', '..', 'server', 'common', 'components')
    ),
    path.normalize(
      path.resolve(dirname, '..', '..', 'server', 'accessibility')
    ),
    path.normalize(path.resolve(dirname, '..', '..', 'server', 'cookies')),
    path.normalize(path.resolve(dirname, '..', '..', 'server', 'error')),
    path.normalize(path.resolve(dirname, '..', '..', 'server', 'home')),
    path.normalize(
      path.resolve(
        dirname,
        '..',
        '..',
        'server',
        'common',
        'templates',
        'partials'
      )
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

const nunjucksConfig = {
  plugin: hapiVision,
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)
          return (context) => template.render(context)
        }
      }
    },
    compileOptions: {
      environment: nunjucksEnvironment
    },
    relativeTo: path.normalize(path.resolve(dirname, '..', '..')),
    path: 'server',
    isCached: config.get('isProduction'),
    context
  }
}

Object.entries(globals).forEach(([name, global]) => {
  nunjucksEnvironment.addGlobal(name, global)
})

Object.entries(filters).forEach(([name, filter]) => {
  nunjucksEnvironment.addFilter(name, filter)
})

addMomentFilters(nunjucksEnvironment)
addDaysToTodayAbrev(nunjucksEnvironment)
addDaysToTodayAbrevWelsh(nunjucksEnvironment)
addToSentenceCase(nunjucksEnvironment)

export { nunjucksConfig }
