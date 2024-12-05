const nunjucks = require('nunjucks')
const path = require('path')

describe('Nunjucks Template', () => {
  let env

  beforeAll(() => {
    env = nunjucks.configure(
      path.normalize(path.resolve(__dirname, '..', '..', 'server', 'cookies'))
    )
  })

  it('should render the page title correctly', () => {
    const context = { title: 'Cookies Page' }
    const result = env.render('partials/title.njk', context)
    expect(result).toContain('<h1 class="govuk-heading-xl">Cookies Page</h1>')
  })

  it('should render paragraphs correctly', () => {
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
    const result = env.render('partials/paragraphs.njk', context)
    expect(result).toContain(
      '<p class="govuk-body">Paragraph W content <a href="/" class="govuk-link">Paragraph A content</a> Paragraph B content</p>'
    )
    expect(result).toContain('<p class="govuk-body">Paragraph C content</p>')
    expect(result).toContain('<p class="govuk-body">Paragraph D content</p>')
    expect(result).toContain(
      '<p class="govuk-body">Paragraph E content <a href="https://ico.org.uk/for-the-public/online/cookies" class="govuk-link">Paragraph F content</a> Paragraph G content</p>'
    )
  })

  it('should render the form correctly', () => {
    const context = {
      headings: {
        a: 'Form Heading A',
        b: 'Form Heading B',
        d: 'Form Heading D'
      },
      paragraphs: {
        h: 'Form Paragraph H',
        ga1: 'Form Paragraph GA1',
        ga2: 'Form Paragraph GA2',
        ga3: 'Form Paragraph GA3',
        ga4: 'Form Paragraph GA4',
        ga5: 'Form Paragraph GA5',
        i: 'Form Paragraph I',
        j: 'Form Paragraph J',
        k: 'Form Paragraph K',
        l: 'Form Paragraph L',
        m: 'Form Paragraph M',
        n: 'Form Paragraph N',
        o: 'Form Paragraph O',
        p: 'Form Paragraph P',
        q: 'Form Paragraph Q',
        r: 'Form Paragraph R',
        s: 'Form Paragraph S',
        buttonText: 'Submit'
      },
      table1: {
        title: 'Table 1 Title',
        text1: 'Table 1 Text 1',
        text2: 'Table 1 Text 2',
        text3: 'Table 1 Text 3',
        text4: 'Table 1 Text 4',
        text5: 'Table 1 Text 5',
        text6: 'Table 1 Text 6'
      },
      table2: {
        text4: 'Table 2 Text 4',
        text5: 'Table 2 Text 5',
        text9: 'Table 2 Text 9',
        text10: 'Table 2 Text 10',
        text11: 'Table 2 Text 11',
        text12: 'Table 2 Text 12'
      }
    }
    const result = env.render('partials/form.njk', context)
    expect(result).toContain('<h2 class="govuk-heading-m">Form Heading A</h2>')
    expect(result).toContain('<p class="govuk-body">Form Paragraph H</p>')
    expect(result).toContain('<h2 class="govuk-heading-m">Form Heading B</h2>')
    expect(result).toContain('<p class="govuk-body">Form Paragraph I</p>')
    expect(result).toContain('<p class="govuk-body">Form Paragraph J</p>')
    expect(result).toContain('<p class="govuk-body">Form Paragraph K</p>')
    expect(result).toContain('<p class="govuk-body">Form Paragraph L</p>')
    expect(result).toContain('<ul class="govuk-list govuk-list--bullet">')
    expect(result).toContain('<li>Form Paragraph M</li>')
    expect(result).toContain('<li>Form Paragraph N</li>')
    expect(result).toContain('<li>Form Paragraph O</li>')
    expect(result).toContain('<li>Form Paragraph P</li>')
    expect(result).toContain('<li>Form Paragraph Q</li>')
    expect(result).toContain(
      '<button class="govuk-button js-cookies-form-button" hidden="">Submit</button>'
    )
  })
})
