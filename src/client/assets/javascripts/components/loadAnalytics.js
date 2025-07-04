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
  if (!window.ga?.loaded) {
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
      function gtag(...args) {
        w.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', 'G-8CMZBTDQBC');
      j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
      d.head.appendChild(j);
    })(window, document, 'script', 'dataLayer', 'G-8CMZBTDQBC');
  }
}
