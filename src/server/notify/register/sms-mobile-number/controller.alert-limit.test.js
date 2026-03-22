import { describe, it, expect, vi } from 'vitest'

import { handleNotifyRequest } from './controller.js'

vi.mock('../../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

vi.mock('../../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test')
}))

vi.mock('../helpers/resolve-notify-language.js', () => ({
  resolveNotifyLanguage: vi.fn(() => 'en')
}))

vi.mock('../../../data/en/en.js', () => ({
  english: {
    common: {
      serviceName: 'Check air quality',
      backLinkText: 'Back'
    },
    smsMobilePhone: {
      pageTitle: 'What is your mobile phone number?',
      heading: 'What is your mobile phone number?',
      errors: {
        empty: 'Enter your mobile phone number',
        format: 'Enter a UK mobile number'
      }
    },
    smsMobileNumber: {
      errors: {
        maxAlertsReached: {
          summary: 'Maximum alerts reached for {phoneNumber}',
          field: 'Maximum alerts reached'
        }
      }
    }
  }
}))

describe('sms-mobile-number/controller alertLimitHint fallback', () => {
  it('uses empty-string fallback when alertLimitHint is absent in content and english fallback', () => {
    const session = {}
    const request = {
      path: '/notify/register/sms-mobile-number',
      query: {},
      yar: {
        get: vi.fn((key) => session[key]),
        set: vi.fn((key, value) => {
          session[key] = value
        }),
        clear: vi.fn((key) => {
          delete session[key]
        })
      }
    }

    const h = {
      view: vi.fn((tpl, vm) => ({ tpl, vm }))
    }

    const contentWithoutHint = {
      footerTxt: {},
      phaseBanner: {},
      cookieBanner: {},
      common: {
        serviceName: 'Check air quality',
        backLinkText: 'Back'
      },
      smsMobilePhone: {
        pageTitle: 'What is your mobile phone number?',
        heading: 'What is your mobile phone number?',
        errors: {
          empty: 'Enter your mobile phone number',
          format: 'Enter a UK mobile number'
        }
      },
      smsMobileNumber: {
        errors: {
          maxAlertsReached: {
            summary: 'Maximum alerts reached for {phoneNumber}',
            field: 'Maximum alerts reached'
          }
        }
      }
    }

    const response = handleNotifyRequest(request, h, contentWithoutHint)

    expect(response.vm.alertLimitHint).toBe('')
  })
})
