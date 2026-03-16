import { cookiesController, cookieConsentAuditHandler } from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/cookies',
    ...cookiesController
  },
  {
    method: 'POST',
    path: '/cookies/consent-audit',
    handler: cookieConsentAuditHandler
  }
]

export { routes }
