// @ts-nocheck

import { JSDOM } from 'jsdom'

let window
let document

if (typeof global !== 'undefined' && typeof window === 'undefined') {
  const dom = new JSDOM(
    '<!DOCTYPE html><html><head></head><body></body></html>',
    {
      url: 'http://localhost'
    }
  )
  window = dom.window
  document = window.document
} else {
  window = globalThis.window
  document = globalThis.document
}

export default function loadAnalytics() {
  if (!window.ga || !window.ga.loaded) {
    // Load gtm script
    // Script based on snippet at https://developers.google.com/tag-manager/quickstart
    // prettier-ignore
    ;(function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      const j = d.createElement(s);
      const dl = l !== 'dataLayer' ? `&l=${l}` : '';

      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtag/js?id=G-8CMZBTDQBC';
      d.head.appendChild(j);
      w.dataLayer = w.dataLayer || [];
      console.log('Initializing dataLayer:', w.dataLayer); // Debug statement
      function gtag() {
        w.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-8CMZBTDQBC');
      j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
      d.head.appendChild(j);
    })(window, document, 'script', 'dataLayer', 'G-8CMZBTDQBC');
  }
}

export function trackVirtualPageview(url, title) {
  if (!window.dataLayer) {
    console.warn(
      'trackVirtualPageview: dataLayer is not available, initializing it.'
    )
    window.dataLayer = []
  }

  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: 'virtualPageview',
        virtualPageviewUrl: url,
        virtualPageviewTitle: title
      })
      console.log(
        'Data successfully pushed to window.dataLayer:',
        window.dataLayer
      ) // Debug statement
    } catch (error) {
      console.error('Error pushing data to window.dataLayer:', error)
    }
  } else {
    console.error(
      'trackVirtualPageview: dataLayer is not an array after initialization.'
    )
  }
}
