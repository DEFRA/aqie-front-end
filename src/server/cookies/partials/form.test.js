import nunjucks from 'nunjucks'
import path from 'path'

describe('Nunjucks cookie form Template', () => {
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

  it('should render the form template correctly', () => {
    const context = {
      headings: {
        a: 'Form Heading A',
        d: 'Form Heading D'
      },
      paragraphs: {
        h: 'Paragraph H content',
        r: 'Yes',
        s: 'No',
        buttonText: 'Submit'
      }
    }
    const result = env.render('form.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<h2 class="govuk-heading-m">Form Heading A</h2>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph H content</p>'
    )
  })
})
