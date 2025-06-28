import nunjucks from 'nunjucks'
import path from 'path'

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

  it('should render the error-500 template correctly', () => {
    const context = {
      notFoundUrl: {
        serviceAPI: {
          heading: 'Internal Server Error',
          paragraphs: {
            a: 'Sorry, something went wrong on our end.'
          }
        }
      }
    }
    const result = env.render('error-500.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<h1 class="govuk-heading-xl">Internal Server Error</h1>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Sorry, something went wrong on our end.</p>'
    )
  })
})
