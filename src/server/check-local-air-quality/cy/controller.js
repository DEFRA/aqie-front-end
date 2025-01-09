import { welsh } from '~/src/server/data/cy/cy.js'

// Define the handler function
const handleHomeRequest = (request, h, content = welsh) => {
  const { query } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content

  // Redirect to the English version if the language is 'en'
  if (query.lang === 'en') {
    return h.redirect(`/?lang=en`)
  }

  // Render the home page with the necessary data
  return h.view('home/index', {
    pageTitle: home.pageTitle,
    heading: home.heading,
    page: home.page,
    paragraphs: home.paragraphs,
    label: home.button,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName: '',
    lang: 'cy'
  })
}

// Define the controller using the handler function
const homeController = {
  handler: handleHomeRequest
}

export { homeController, handleHomeRequest }
