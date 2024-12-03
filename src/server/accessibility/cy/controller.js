import { welsh } from '~/src/server/data/cy/cy.js';

// Define the handler function
const accessibilityHandler = (request, h, content = welsh) => {
  // Destructure necessary data from the imported 'content' object
  const {
    footer: {
      accessibility: { pageTitle, title, heading, headings, paragraphs }
    },
    cookieBanner,
    phaseBanner,
    footerTxt,
    multipleLocations: { serviceName }
  } = content;

  // Extract query parameters and path from the request
  const { query, path } = request;
  const lang = query?.lang?.slice(0, 2);

  // Redirect to English version if language is 'en'
  if (lang === 'en') {
    return h.redirect('/accessibility?lang=en');
  }

  // Default to Welsh if language is not 'cy' or 'en' and path is '/preifatrwydd/cy'
  const effectiveLang = (lang !== 'cy' && lang !== 'en' && path === '/preifatrwydd/cy') ? 'cy' : lang;

  // Render the accessibility page with the necessary data
  return h.view('accessibility/index', {
    pageTitle,
    title,
    heading,
    headings,
    paragraphs,
    displayBacklink: false,
    phaseBanner,
    footerTxt,
    serviceName,
    cookieBanner,
    lang: effectiveLang
  });
};

// Define the controller using the handler function
const accessibilityController = {
  handler: accessibilityHandler
};

export { accessibilityController, accessibilityHandler };