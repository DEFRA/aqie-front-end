const nunjucks = require('nunjucks')
const path = require('path')

describe('Nunjucks Template', () => {
  let env

  beforeAll(() => {
    env = nunjucks.configure(path.join(__dirname, 'server/accessibility/'))
  })

  it('should render the page title correctly', () => {
    const context = { title: 'Accessibility Page' }
    const result = env.render('partials/page-title.njk', context)
    expect(result).toContain(
      '<h1 class="govuk-heading-xl odd-page">Accessibility Page</h1>'
    )
  })

  it('should render paragraphs and headings correctly', () => {
    const context = {
      paragraphs: {
        a: 'Paragraph A content',
        b: 'Paragraph B content',
        c: 'Paragraph C content',
        d: 'Paragraph D content',
        e: 'Paragraph E content',
        f: 'Paragraph F content'
      },
      headings: {
        a: 'Heading A',
        b: 'Heading B'
      }
    }
    const result = env.render('partials/paragraphs-and-headings.njk', context)
    expect(result).toContain('<p class="govuk-body">Paragraph A content</p>')
    expect(result).toContain('<p class="govuk-body">Paragraph B content')
    expect(result).toContain(
      '<a href="https://check-air-quality.service.gov.uk/">https://check-air-quality.service.gov.uk/</a>'
    )
    expect(result).toContain('<h2 class="govuk-heading-m">Heading A</h2>')
    expect(result).toContain('<p class="govuk-body">Paragraph C content</p>')
    expect(result).toContain('<h2 class="govuk-heading-m">Heading B</h2>')
    expect(result).toContain('<p class="govuk-body">Paragraph D content</p>')
    expect(result).toContain('<p class="govuk-body">Paragraph E content</p>')
    expect(result).toContain('<p class="govuk-body">Paragraph F content</p>')
  })
})
