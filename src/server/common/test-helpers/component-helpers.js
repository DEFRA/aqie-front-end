import { fileURLToPath } from 'node:url'
import path, { dirname } from 'node:path'
import nunjucks from 'nunjucks'
import { load } from 'cheerio'
import { camelCase } from 'lodash'
import * as filters from '../../config/nunjucks/filters.js'
import * as globals from '../../config/nunjucks/globals.js' // Updated imports to use relative paths

const __dirname = dirname(fileURLToPath(import.meta.url))
const nunjucksTestEnv = nunjucks.configure(
  [
    '~/node_modules/govuk-frontend/dist/',
    path.normalize(path.resolve(__dirname, '../templates')),
    path.normalize(path.resolve(__dirname, '../components'))
  ],
  {
    trimBlocks: true,
    lstripBlocks: true
  }
)

Object.entries(globals).forEach(([name, global]) => {
  nunjucksTestEnv.addGlobal(name, global)
})

Object.entries(filters).forEach(([name, filter]) => {
  nunjucksTestEnv.addFilter(name, filter)
})

/**
 * @param {string} componentName
 * @param {object} params
 * @param {string} [callBlock]
 */
export function renderComponent(componentName, params, callBlock) {
  const macroPath = `${componentName}/macro.njk`
  const macroName = `app${
    componentName.charAt(0).toUpperCase() + camelCase(componentName.slice(1))
  }`
  const macroParams = JSON.stringify(params, null, 2)
  let macroString = `{%- from "${macroPath}" import ${macroName} -%}`

  if (callBlock) {
    macroString += `{%- call ${macroName}(${macroParams}) -%}${callBlock}{%- endcall -%}`
  } else {
    macroString += `{{- ${macroName}(${macroParams}) -}}`
  }

  return load(nunjucksTestEnv.renderString(macroString, {}))
}
