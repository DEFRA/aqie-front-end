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

  it('should render the error-404-cy template correctly', () => {
    // ''
    // Updated context to match the template keys in error-404-cy.njk
    const context = {
      notFoundUrl: {
        nonService: {
          heading: 'Tudalen heb ei chanfod',
          paragraphs: {
            a: 'Mae’n ddrwg gennym, ni allwn ddod o hyd i’r dudalen rydych yn chwilio amdani.',
            b: 'Gwiriwch y cyfeiriad URL a rhowch gynnig arall arni.',
            c: 'Os ydych yn parhau i gael problemau, cysylltwch â ni yn ',
            d: 'checklocalairquality@defra.gov.uk',
            e: ' am gymorth pellach.'
          }
        }
      },
      msError: '404'
    }
    const result = env.render('error-404-cy.njk', context)
    const html = result.replace(/\s+/g, ' ')
    expect(html).toContain(
      '<h1 class="govuk-heading-xl">Tudalen heb ei chanfod 404</h1>'
    )
    expect(html).toContain(
      '<p class="govuk-body">Mae’n ddrwg gennym, ni allwn ddod o hyd i’r dudalen rydych yn chwilio amdani.</p>'
    )
    expect(html).toContain(
      '<p class="govuk-body">Gwiriwch y cyfeiriad URL a rhowch gynnig arall arni.</p>'
    )
    expect(html).toContain(
      '<p class="govuk-body">Os ydych yn parhau i gael problemau, cysylltwch â ni yn <a href="mailto:checklocalairquality@defra.gov.uk">checklocalairquality@defra.gov.uk</a> am gymorth pellach.</p>'
    )
  })
})
