const nunjucks = require('nunjucks')
const path = require('path')

describe('Nunjucks Template', () => {
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
            'error',
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

  it('should render the error-404-cy template correctly', () => {
    const context = {
      notFoundUrl: {
        nonService: {
          heading: 'Page not found',
          paragraphs: {
            aa: 'Sorry, we cannot find the page you are looking for.',
            b: 'Please check the URL and try again.',
            c: 'If you continue to experience issues, please contact us at ',
            d: 'checklocalairquality@defra.gov.uk',
            e: ' for further assistance.'
          }
        }
      },
      msError: '404'
    }
    const result = env.render('error-404-cy.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<h1 class="govuk-heading-xl">Page not found 404</h1>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Sorry, we cannot find the page you are looking for.</p>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Please check the URL and try again.</p>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">If you continue to experience issues, please contact us at <a href="mailto:checklocalairquality@defra.gov.uk">checklocalairquality@defra.gov.uk</a> for further assistance.</p>'
    )
  })
})
