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
            'accessibility',
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

  it('should render the paragraphs and headings template correctly', () => {
    const context = {
      paragraphs: {
        d: 'Paragraph D content',
        e: 'Paragraph E content',
        f: 'Paragraph F content'
      }
    }
    const result = env.render('paragraphs-and-headings.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph D content</p>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph E content</p>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph F content</p>'
    )
  })
})
