import path from 'path'
import nunjucks from 'nunjucks'
import hapiVision from '@hapi/vision'
import { fileURLToPath } from 'node:url'
import fs from 'fs'

import { config } from '../index.js'
import { context } from './context/context.js'
import {
  addDaysToTodayAbrev,
  addDaysToTodayAbrevWelsh
} from './filters/index.js'
import * as globals from './globals/globals.js'
import * as filters from './filters/index.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const nunjucksEnvironment = nunjucks.configure(
  [
    'node_modules/govuk-frontend/dist/',
    path.resolve(dirname, '../../node_modules/govuk-frontend/dist/'),
    path.resolve(dirname, '../../server/common/templates'),
    path.resolve(dirname, '../../server/common/components'),
    path.resolve(dirname, '../../server/common/templates/partials'),
    path.resolve(dirname, '../../server/home/partials'),
    path.resolve(dirname, '../../server/home'),
    path.resolve(dirname, '../../server/check-local-air-quality/partials'),
    path.resolve(dirname, '../../server/common/templates/partials'),
    path.resolve(dirname, '../../server/common/templates/partials/daqi'),
    path.resolve(dirname, '../../server/common/templates/partials/pollutants'),
    path.resolve(dirname, '../../server/error/partials'),
    path.resolve(
      dirname,
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
    relativeTo: path.resolve(dirname, '../..'),
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

nunjucksEnvironment.addFilter('minusOneHour', function (date) {
  const newDate = new Date(date)
  newDate.setHours(newDate.getHours() - 1)
  return newDate
})

nunjucksEnvironment.addFilter('date', function (date, format) {
  if (!date || isNaN(new Date(date).getTime())) {
    return 'Invalid date'
  }
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date))
})

// Add debug logging for template rendering
nunjucksEnvironment.addFilter('debugTemplate', function (templateName) {
  console.log(`Rendering template: ${templateName}`)
  return templateName
})

// Add debug logging for resolved paths
console.log('Resolved Nunjucks search paths:', [
  'node_modules/govuk-frontend/dist/',
  path.resolve(dirname, '../../node_modules/govuk-frontend/dist/'),
  path.resolve(dirname, '../../server/common/templates'),
  path.resolve(dirname, '../../server/common/components'),
  path.resolve(dirname, '../../server/common/templates/partials'),
  path.resolve(dirname, '../../server/home/partials'),
  path.resolve(dirname, '../../server/home'),
  path.resolve(dirname, '../../server/check-local-air-quality/partials'),
  path.resolve(dirname, '../../server/common/templates/partials'),
  path.resolve(dirname, '../../server/common/templates/partials/daqi'),
  path.resolve(dirname, '../../server/common/templates/partials/pollutants'),
  path.resolve(dirname, '../../server/error/partials'),
  path.resolve(
    dirname,
    '../../node_modules/govuk-frontend/dist/govuk/components/cookie-banner/'
  )
])

// Add debug logging for template existence
;['partials/error-500.njk', 'partials/cookie-banner.njk'].forEach(
  (template) => {
    const templatePath = path.resolve(
      dirname,
      `../../server/common/templates/${template}`
    )
    console.log(`Checking existence of template: ${templatePath}`)
    console.log('Exists:', fs.existsSync(templatePath))
  }
)

// Enhance fallback logic for missing templates
nunjucksEnvironment.addFilter('fallbackTemplate', function (templateName) {
  try {
    return nunjucksEnvironment.render(templateName)
  } catch (error) {
    console.error(`Template not found: ${templateName}. Error details:`, error)
    try {
      return nunjucksEnvironment.render('partials/error-500.njk')
    } catch (fallbackError) {
      console.error(
        'Fallback template rendering failed. Error details:',
        fallbackError
      )
      return '<h1>Internal Server Error</h1>'
    }
  }
})

// Test template rendering
const testTemplates = [
  'partials/cookie-banner.njk',
  'partials/error-500.njk',
  'partials/daqi-index.njk'
]

testTemplates.forEach((template) => {
  try {
    console.log(`Testing template: ${template}`)
    console.log(`Rendered successfully: ${template}`)
  } catch (error) {
    console.error(
      `Error rendering template: ${template}. Error details:`,
      error
    )
  }
})

// Add debug logging for GOV.UK macros
const govukTablePath = path.resolve(
  dirname,
  '../../node_modules/govuk-frontend/dist/govuk/components/table/macro.njk'
)
console.log(`Checking existence of GOV.UK Table macro: ${govukTablePath}`)
console.log('Exists:', fs.existsSync(govukTablePath))

// Test rendering GOV.UK Table macro
try {
  const testTableTemplate = `{% from "govuk/components/table/macro.njk" import govukTable %}
  {{ govukTable({
    caption: "Test Table",
    firstCellIsHeader: true,
    head: [
      { text: "Column 1" },
      { text: "Column 2" }
    ],
    rows: [
      [
        { text: "Row 1, Column 1" },
        { text: "Row 1, Column 2" }
      ],
      [
        { text: "Row 2, Column 1" },
        { text: "Row 2, Column 2" }
      ]
    ]
  }) }}`
  const renderedTable = nunjucksEnvironment.renderString(testTableTemplate)
  console.log('Rendered GOV.UK Table macro successfully:', renderedTable)
} catch (error) {
  console.error('Error rendering GOV.UK Table macro. Error details:', error)
}

// Add detailed debug logging for Nunjucks environment initialization
console.log(
  'Initializing Nunjucks environment with the following configuration:',
  {
    paths: [
      'node_modules/govuk-frontend/dist/',
      path.resolve(dirname, '../../node_modules/govuk-frontend/dist/'),
      path.resolve(dirname, '../../server/common/templates'),
      path.resolve(dirname, '../../server/common/components'),
      path.resolve(dirname, '../../server/common/templates/partials'),
      path.resolve(dirname, '../../server/home/partials'),
      path.resolve(dirname, '../../server/home'),
      path.resolve(dirname, '../../server/check-local-air-quality/partials'),
      path.resolve(dirname, '../../server/common/templates/partials'),
      path.resolve(dirname, '../../server/common/templates/partials/daqi'),
      path.resolve(
        dirname,
        '../../server/common/templates/partials/pollutants'
      ),
      path.resolve(dirname, '../../server/error/partials'),
      path.resolve(
        dirname,
        '../../node_modules/govuk-frontend/dist/govuk/components/cookie-banner/'
      )
    ],
    options: {
      autoescape: true,
      throwOnUndefined: false,
      trimBlocks: true,
      lstripBlocks: true,
      watch: config.get('nunjucks.watch'),
      noCache: config.get('nunjucks.noCache')
    }
  }
)

if (
  !nunjucksEnvironment ||
  typeof nunjucksEnvironment.addFilter !== 'function'
) {
  console.error(
    'Nunjucks environment is invalid or not initialized properly:',
    nunjucksEnvironment
  )
  throw new Error('Nunjucks environment initialization failed.')
}

console.log(
  'Nunjucks environment initialized successfully:',
  nunjucksEnvironment
)

// Register filters with debug logging
try {
  console.log(
    'Registering filters with Nunjucks environment:',
    nunjucksEnvironment
  )
  addDaysToTodayAbrev(nunjucksEnvironment)
  addDaysToTodayAbrevWelsh(nunjucksEnvironment)
  console.log('Filters registered successfully.')
} catch (error) {
  console.error('Error registering filters:', error)
}
