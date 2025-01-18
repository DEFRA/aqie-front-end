import { english } from '~/src/server/data/en/en.js'

const handleHomeRequest = (request, h, content = english) => {
  const { query } = request
  const { home, footerTxt, phaseBanner, backlink, cookieBanner } = content

  if (query.lang === 'cy') {
    return h.redirect(`cy`)
  }

  return h.view('home/index', {
    pageTitle: home.pageTitle,
    description: home.description,
    heading: home.heading,
    page: home.page,
    paragraphs: home.paragraphs,
    label: home.button,
    footerTxt,
    phaseBanner,
    backlink,
    cookieBanner,
    serviceName: '',
    lang: 'en'
  })
}

const homeController = {
  handler: handleHomeRequest
}

export { homeController, handleHomeRequest }
