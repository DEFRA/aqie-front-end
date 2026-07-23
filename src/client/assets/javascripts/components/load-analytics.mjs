// @ts-nocheck
export default function loadAnalytics() {
  if (!window.gtmLoaded) {
    window.gtmLoaded = true
    window.dataLayer = window.dataLayer || []
    function gtag() { window.dataLayer.push(arguments) }
    // This function only runs after the user has already accepted analytics
    // cookies (see initializeAnalytics() in application.js), so consent is
    // granted by default here.
    gtag('consent', 'default', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      personalization_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted'
    })
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
