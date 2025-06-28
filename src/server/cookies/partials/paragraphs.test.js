import nunjucks from 'nunjucks'
import path from 'path'

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

  it('should render the paragraphs template correctly', () => {
    const context = {
      paragraphs: {
        w: 'Paragraph W content',
        a: 'Paragraph A content',
        b: 'Paragraph B content',
        c: 'Paragraph C content',
        d: 'Paragraph D content',
        e: 'Paragraph E content',
        f: 'Paragraph F content',
        g: 'Paragraph G content'
      }
    }
    const result = env.render('paragraphs.njk', context)
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph W content <a href="/" class="govuk-link">Paragraph A content</a> Paragraph B content</p>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph C content</p>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph D content</p>'
    )
    expect(result.replace(/\s+/g, ' ')).toContain(
      '<p class="govuk-body">Paragraph E content <a href="https://ico.org.uk/for-the-public/online/cookies" class="govuk-link">Paragraph F content</a> Paragraph G content</p>'
    )
  })
})
