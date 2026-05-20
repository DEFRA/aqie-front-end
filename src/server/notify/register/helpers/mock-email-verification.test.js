import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { config } from '../../../../config/index.js'
import { buildBackendApiRequest } from '../../../common/helpers/backend-api-helper.js'
import {
  MOCK_GENERATE_LINK_ENDPOINT_HEADER,
  MOCK_VERIFICATION_TOKEN_HEADER,
  maybeApplyMockVerificationHeaders,
  syncMockVerificationTokenFromGenerateLinkResult
} from './mock-email-verification.js'

const SESSION_KEY = 'mockEmailVerificationToken'
const NOTIFY_BASE_URL = 'https://aqie-notify-service.dev.cdp-int.defra.cloud'
const EMAIL_GENERATE_LINK_PATH = '/subscribe/generate-link'

function defaultConfigGet(key) {
  if (key === 'notify.baseUrl') {
    return NOTIFY_BASE_URL
  }
  if (key === 'notify.emailGenerateLinkPath') {
    return EMAIL_GENERATE_LINK_PATH
  }
  return undefined
}

vi.mock('../../../../config/index.js', () => ({
  config: {
    get: vi.fn(defaultConfigGet)
  }
}))

vi.mock('../../../common/helpers/backend-api-helper.js', () => ({
  buildBackendApiRequest: vi.fn((_request, baseUrl, apiPath) => ({
    url: `${baseUrl}${apiPath}`
  }))
}))

const SESSION_TOKEN = 'mock-token'
const TOKEN_FROM_DATA = 'mock-token-1'
const TOKEN_FROM_NESTED = 'mock-token-2'
const TOKEN_FROM_CDP_PROD = 'mock-token-prod-cdp'
const TOKEN_FROM_NON_CDP_PROD = 'mock-token-prod'
const STALE_TOKEN = 'stale-token'
const NON_CDP_HOST = 'www.example.com'
const CDP_TEST_HOST = 'app.test.cdp-int.defra.cloud'
const FULL_GENERATE_LINK_URL = `${NOTIFY_BASE_URL}${EMAIL_GENERATE_LINK_PATH}`

const createRequest = (session = {}, headers = {}) => {
  const state = { ...session }

  return {
    headers,
    yar: {
      get: vi.fn((key) => state[key]),
      set: vi.fn((key, value) => {
        state[key] = value
      }),
      clear: vi.fn((key) => {
        delete state[key]
      })
    }
  }
}

const originalNodeEnv = process.env.NODE_ENV

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(config.get).mockImplementation(defaultConfigGet)
  vi.mocked(buildBackendApiRequest).mockImplementation(
    (_request, baseUrl, apiPath) => ({
      url: `${baseUrl}${apiPath}`
    })
  )
  process.env.NODE_ENV = 'development'
})

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv
})

describe('syncMockVerificationTokenFromGenerateLinkResult', () => {
  it('stores token from data.verificationToken', () => {
    const request = createRequest()

    const token = syncMockVerificationTokenFromGenerateLinkResult(request, {
      data: { verificationToken: TOKEN_FROM_DATA }
    })

    expect(token).toBe(TOKEN_FROM_DATA)
    expect(request.yar.set).toHaveBeenCalledWith(SESSION_KEY, TOKEN_FROM_DATA)
    expect(request.yar.clear).not.toHaveBeenCalled()
  })

  it('stores token from nested response shapes', () => {
    const request = createRequest()

    const token = syncMockVerificationTokenFromGenerateLinkResult(request, {
      body: { data: { verificationToken: TOKEN_FROM_NESTED } }
    })

    expect(token).toBe(TOKEN_FROM_NESTED)
    expect(request.yar.set).toHaveBeenCalledWith(SESSION_KEY, TOKEN_FROM_NESTED)
  })

  it('clears stale token when generate-link response has no token', () => {
    const request = createRequest({ [SESSION_KEY]: STALE_TOKEN })

    const token = syncMockVerificationTokenFromGenerateLinkResult(request, {
      ok: true,
      data: {}
    })

    expect(token).toBe('')
    expect(request.yar.clear).toHaveBeenCalledWith(SESSION_KEY)
    expect(request.yar.set).not.toHaveBeenCalled()
  })

  it('clears token in production for non-CDP hosts', () => {
    process.env.NODE_ENV = 'production'
    const request = createRequest(
      { [SESSION_KEY]: STALE_TOKEN },
      { host: NON_CDP_HOST }
    )

    const token = syncMockVerificationTokenFromGenerateLinkResult(request, {
      data: { verificationToken: TOKEN_FROM_NON_CDP_PROD }
    })

    expect(token).toBe('')
    expect(request.yar.clear).toHaveBeenCalledWith(SESSION_KEY)
    expect(request.yar.set).not.toHaveBeenCalled()
  })

  it('keeps token capture enabled in production for CDP test hosts', () => {
    process.env.NODE_ENV = 'production'
    const request = createRequest({}, { host: CDP_TEST_HOST })

    const token = syncMockVerificationTokenFromGenerateLinkResult(request, {
      data: { verificationToken: TOKEN_FROM_CDP_PROD }
    })

    expect(token).toBe(TOKEN_FROM_CDP_PROD)
    expect(request.yar.set).toHaveBeenCalledWith(
      SESSION_KEY,
      TOKEN_FROM_CDP_PROD
    )
  })
})

describe('maybeApplyMockVerificationHeaders', () => {
  it('returns response unchanged when no header function exists', () => {
    const request = createRequest({ [SESSION_KEY]: SESSION_TOKEN })
    const response = {}

    const result = maybeApplyMockVerificationHeaders(request, response)

    expect(result).toBe(response)
  })

  it('does not emit headers when token is unavailable in session', () => {
    const request = { headers: {}, yar: {} }
    const response = { header: vi.fn() }

    const result = maybeApplyMockVerificationHeaders(request, response)

    expect(result).toBe(response)
    expect(response.header).not.toHaveBeenCalled()
  })

  it('emits verification and endpoint headers when token exists', () => {
    const request = createRequest({ [SESSION_KEY]: SESSION_TOKEN })
    const response = { header: vi.fn() }

    maybeApplyMockVerificationHeaders(request, response)

    expect(response.header).toHaveBeenCalledWith(
      MOCK_VERIFICATION_TOKEN_HEADER,
      SESSION_TOKEN
    )
    expect(response.header).toHaveBeenCalledWith(
      MOCK_GENERATE_LINK_ENDPOINT_HEADER,
      FULL_GENERATE_LINK_URL
    )
    expect(buildBackendApiRequest).toHaveBeenCalledWith(
      request,
      NOTIFY_BASE_URL,
      EMAIL_GENERATE_LINK_PATH
    )
  })

  it('skips endpoint header when endpoint config is incomplete', () => {
    vi.mocked(config.get).mockImplementation((key) => {
      if (key === 'notify.baseUrl') {
        return ''
      }
      return defaultConfigGet(key)
    })

    const request = createRequest({ [SESSION_KEY]: SESSION_TOKEN })
    const response = { header: vi.fn() }

    maybeApplyMockVerificationHeaders(request, response)

    const headerNames = response.header.mock.calls.map(([name]) => name)
    expect(headerNames).toContain(MOCK_VERIFICATION_TOKEN_HEADER)
    expect(headerNames).not.toContain(MOCK_GENERATE_LINK_ENDPOINT_HEADER)
  })

  it('does not emit headers in production for non-CDP hosts', () => {
    process.env.NODE_ENV = 'production'
    const request = createRequest(
      { [SESSION_KEY]: SESSION_TOKEN },
      { host: NON_CDP_HOST }
    )
    const response = { header: vi.fn() }

    maybeApplyMockVerificationHeaders(request, response)

    expect(response.header).not.toHaveBeenCalled()
  })
})
