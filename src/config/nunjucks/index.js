import path from 'path'
import nunjucks from 'nunjucks'
import hapiVision from '@hapi/vision'

import { config } from '~/src/config'
import { context } from './context'
import * as filters from './filters'
import * as globals from './globals'
import {
  addMomentFilters,
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh
} from './filters/index'

const nunjucksEnvironment = nunjucks.configure(
  [
    'node_modules/govuk-frontend/dist/',
    path.normalize(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'node_modules',
        'govuk-frontend',
        'dist'
      )
    ),
    path.normalize(
      path.resolve(__dirname, '..', '..', 'server', 'common', 'templates')
    ),
    path.normalize(
      path.resolve(__dirname, '..', '..', 'server', 'common', 'components')
    ),
    path.normalize(
      path.resolve(__dirname, '..', '..', 'server', 'accessibility')
    ),
    path.normalize(path.resolve(__dirname, '..', '..', 'server', 'cookies')),
    path.normalize(path.resolve(__dirname, '..', '..', 'server', 'error')),
    path.normalize(path.resolve(__dirname, '..', '..', 'server', 'home')),
    path.normalize(
      path.resolve(
        __dirname,
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
    watch: config.get('isDevelopment'),
    noCache: config.get('isDevelopment')
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
    relativeTo: path.normalize(path.resolve(__dirname, '..', '..')),
    path: 'server',
    isCached: config.get('isProduction'),
    context
  }
}

Object.keys(globals).forEach((global) => {
  nunjucksEnvironment.addFilter(global, globals[global])
})

Object.keys(filters).forEach((filter) => {
  nunjucksEnvironment.addFilter(filter, filters[filter])
})

addMomentFilters(nunjucksEnvironment)
addDaysToTodayAbrev(nunjucksEnvironment)
addDaysToTodayAbrevWelsh(nunjucksEnvironment)

export { nunjucksConfig }
