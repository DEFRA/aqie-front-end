const nunjucks = require('nunjucks')
const path = require('path')

describe('Nunjucks Template', () => {
  let env

  beforeAll(() => {
    env = nunjucks.configure(path.join(__dirname, 'views'))
  })

  it('should render the 500 error correctly', () => {
    const context = {
      notFoundUrl: {
        serviceAPI: {
          heading: 'Service Unavailable',
          paragraphs: {
            a: 'We are currently experiencing technical difficulties.',
            b: 'Please try again later or contact support at',
            c: 'support@example.com',
            d: 'for assistance.'
          }
        }
      }
    }
    const result = env.render('partials/error-500.njk', context)
    expect(result).toContain(
      '<h1 class="govuk-heading-xl">Service Unavailable</h1>'
    )
    expect(result).toContain(
      '<p>We are currently experiencing technical difficulties.</p>'
    )
    expect(result).toContain(
      '<p class="govuk-body">Please try again later or contact support at <a href="mailto:support@example.com">support@example.com</a>for assistance.</p>'
    )
  })

  it('should render the 404 error in English correctly', () => {
    const context = {
      notFoundUrl: {
        nonService: {
          heading: 'Page Not Found',
          paragraphs: {
            a: 'The page you are looking for does not exist.',
            b: 'Please check the URL or contact support at',
            c: 'support@example.com',
            d: 'for assistance.',
            e: ''
          }
        },
        msError: 'Error'
      }
    }
    const result = env.render('partials/error-404-en.njk', context)
    expect(result).toContain(
      '<h1 class="govuk-heading-xl">Page Not Found Error</h1>'
    )
    expect(result).toContain(
      '<p class="govuk-body">The page you are looking for does not exist.</p>'
    )
    expect(result).toContain(
      '<p class="govuk-body">Please check the URL or contact support at <a href="mailto:support@example.com">support@example.com</a>for assistance.</p>'
    )
  })

  it('should render the 404 error in Welsh correctly', () => {
    const context = {
      notFoundUrl: {
        nonService: {
          heading: 'Tudalen Heb Ei Darganfod',
          paragraphs: {
            a: "Nid yw'r dudalen rydych yn chwilio amdani yn bodoli.",
            b: "Gwiriwch yr URL neu cysylltwch â'r gefnogaeth yn",
            c: 'support@example.com',
            d: 'am gymorth.',
            e: ''
          }
        },
        msError: 'Gwall'
      }
    }
    const result = env.render('partials/error-404-cy.njk', context)
    expect(result).toContain(
      '<h1 class="govuk-heading-xl">Tudalen Heb Ei Darganfod Gwall</h1>'
    )
    expect(result).toContain(
      '<p class="govuk-body">Nid yw\'r dudalen rydych yn chwilio amdani yn bodoli.</p>'
    )
    expect(result).toContain(
      '<p class="govuk-body">Gwiriwch yr URL neu cysylltwch â\'r gefnogaeth yn <a href="mailto:support@example.com">support@example.com</a>am gymorth.</p>'
    )
  })
})
