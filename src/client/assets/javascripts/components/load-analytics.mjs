// @ts-nocheck
export default function loadAnalytics() {
    if (!window.ga?.loaded) {
      window.dataLayer = window.dataLayer || []
      if(localStorage.getItem('consentMode') === null){
        window.dataLayer.push('consent', 'default', {
          'ad_storage': 'denied',
          'analytics_storage': 'denied',
          'personalization_storage': 'denied',
          'functionality_storage': 'denied',
          'security_storage': 'denied',
        })
      } else {
        window.dataLayer.push('consent', 'default', JSON.parse(localStorage.getItem('consentMode')))
      }
      // prettier-ignore
      ;(function (w, d, s, l, i) {
        w[l] = w[l] || []
        w[l].push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        })
        ///
        const noscript = document.createElement('noscript')
        const iframe = document.createElement('iframe')
        iframe.setAttribute("height", "0")
        iframe.setAttribute("width", "0")
        iframe.setAttribute("style", "display:none;visibility:hidden")
        iframe.async = true
        iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-PBFV8FNC"
        noscript.appendChild(iframe)
        document.body.appendChild(noscript)
        ///
        const k = d.createElement(s)
        k.async = true
        k.src = "https://www.googletagmanager.com/gtag/js?id=G-8CMZBTDQBC"
        document.body.appendChild(k)
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        const utmSource = urlParams.get('utm_source'); // Renamed variable
        const utmCampaign = urlParams.get('utm_campaign'); // Renamed variable
        const utmMedium = urlParams.get('utm_medium'); // Renamed variable
        window.dataLayer.push('js', new Date())
        window.dataLayer.push('config', 'G-8CMZBTDQBC', {
          'user_id': utmSource // Updated reference
        })
        window.dataLayer.push({
          'event': 'airQualityData',
          'userSeg': userId,
          'login_status': 'logged in',
          'utm_source': utmSource, // Updated reference
          utm_medium: utmMedium, // Updated reference
          utm_campaign: utmCampaign // Updated reference
        })
        ///
        const f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l !== 'dataLayer' ? '&l=' + l : ''
        j.async = true;
        j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`
        f.parentNode.insertBefore(j, f)
      })(window, document, 'script', 'dataLayer', 'GTM-PBFV8FNC')
    }
}
