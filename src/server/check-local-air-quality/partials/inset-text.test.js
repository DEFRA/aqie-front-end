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

  it('should render the language toggle template correctly for English', () => {
    const context = {
      lang: 'en'
    }
    const result = env.render('inset-text.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      "<p class='govuk-body'>This page is also available <a class='govuk-link' href='/cy'> in Welsh</a> (<a href='/cy' hreflang='cy'>Cymraeg</a>).</p>"
    )
  })

  it('should render the language toggle template correctly for Welsh', () => {
    const context = {
      lang: 'cy'
    }
    const result = env.render('inset-text.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      "<p class='govuk-body'>Mae'r dudalen hon hefyd ar gael <a class='govuk-link' href='/'> yn Saesneg</a> (<a href='/' hreflang='en'>English</a>).</p>"
    )
  })
})
