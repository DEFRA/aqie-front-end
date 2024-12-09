const nunjucks = require('nunjucks')
const path = require('path')

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
            'cookies',
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

  it('should render the notification banner template correctly', () => {
    const context = {}
    const result = env.render('notification-banner.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-notification-banner__heading">You’ve set your cookie preferences.</p>'
    )
  })
})
