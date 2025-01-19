const nunjucks = require('nunjucks')
const path = require('path')
const { LANG_CY } = require('~/src/server/data/constants')

describe('Nunjucks cookie banner Template', () => {
  let env

  beforeAll(() => {
    env = nunjucks.configure(
      [
        'node_modules/govuk-frontend/dist/',
        path.normalize(
          path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'node_modules',
            'govuk-frontend',
            'dist'
          )
        ),
        path.normalize(
          path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            'server',
            'home',
            'partials'
          )
        )
      ],
      {
        trimBlocks: true,
        lstripBlocks: true,
        autoescape: true,
        noCache: true
      }
    )
  })

  it('should render the start button template correctly for English', () => {
    const context = {
      htmlLang: 'en',
      label: 'Start now'
    }
    const result = env.render('start-button.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<a href="/search-location?lang=en" role="button" draggable="false" class="govuk-button govuk-button--start" data-module="govuk-button"> Start now <svg class="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false"> <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"/> </svg> </a>'
    )
  })

  it('should render the start button template correctly for Welsh', () => {
    const context = {
      htmlLang: LANG_CY,
      label: 'Dechrau nawr'
    }
    const result = env.render('start-button.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<a href="/chwilio-lleoliad/cy?lang=cy" role="button" draggable="false" class="govuk-button govuk-button--start" data-module="govuk-button"> Dechrau nawr <svg class="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false"> <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"/> </svg> </a>'
    )
  })
})
