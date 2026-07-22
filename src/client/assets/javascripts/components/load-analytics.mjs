// @ts-nocheck
export default function loadAnalytics() {
  if (!window.ga?.loaded) {
    window.dataLayer = window.dataLayer || []
    if (localStorage.getItem('consentMode') === null) {
      window.dataLayer.push('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        personalization_storage: 'denied',
        functionality_storage: 'denied',
        security_storage: 'denied'
      })
    } else {
      window.dataLayer.push(
        'consent',
        'default',
        JSON.parse(localStorage.getItem('consentMode'))
      )
    }
    // prettier-ignore
    ;(function (w, d, s, l, i) {
        const noscript2 = document.createElement('noscript')
        const iframe2 = document.createElement('iframe')
        iframe2.setAttribute('height', '0')
        iframe2.setAttribute('width', '0')
        iframe2.setAttribute('style', 'display:none;visibility:hidden')
        iframe2.src = `https://www.googletagmanager.com/ns.html?id=${i}`
        noscript2.appendChild(iframe2)
        document.body.appendChild(noscript2)
        ///
        const f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l !== 'dataLayer' ? '&l=' + l : ''
        j.async = true
        j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`
        f.parentNode.insertBefore(j, f)
      })(window, document, 'script', 'dataLayer', 'GTM-PCJNTC4H')
  }
}
