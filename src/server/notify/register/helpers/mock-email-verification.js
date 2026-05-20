import { config } from '../../../../config/index.js'
import { buildBackendApiRequest } from '../../../common/helpers/backend-api-helper.js'

const MOCK_VERIFICATION_TOKEN_HEADER = 'x-aqie-email-verification-token'
const MOCK_GENERATE_LINK_ENDPOINT_HEADER = 'x-aqie-email-generate-link-endpoint'
const MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY = 'mockEmailVerificationToken'
const CDP_TEST_HOST_MARKER = '.test.cdp-int.'
const CDP_PERF_TEST_HOST_MARKER = '.perf-test.cdp-int.'
const CDP_PERF_HOST_MARKER = '.perf.cdp-int.'

const clearMockVerificationToken = (request) => {
  if (typeof request?.yar?.clear === 'function') {
    request.yar.clear(MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY)
  }
}

const setMockVerificationToken = (request, token) => {
  if (typeof request?.yar?.set === 'function') {
    request.yar.set(MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY, token)
  }
}

const getMockVerificationToken = (request) => {
  if (typeof request?.yar?.get !== 'function') {
    return ''
  }

  return request.yar.get(MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY) || ''
}

const isCdpTestOrPerfRequest = (request) => {
  const host = request?.headers?.host?.toLowerCase() || ''
  return (
    host.includes(CDP_TEST_HOST_MARKER) ||
    host.includes(CDP_PERF_TEST_HOST_MARKER) ||
    host.includes(CDP_PERF_HOST_MARKER)
  )
}

const isMockVerificationHeaderEnabled = (request) => {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'production' || isCdpTestOrPerfRequest(request)
}

const extractMockVerificationToken = (generateLinkResult) => {
  if (!generateLinkResult || typeof generateLinkResult !== 'object') {
    return ''
  }

  const tokenCandidates = [
    generateLinkResult?.data?.verificationToken,
    generateLinkResult?.data?.data?.verificationToken,
    generateLinkResult?.body?.verificationToken,
    generateLinkResult?.body?.data?.verificationToken
  ]

  const token = tokenCandidates.find((value) => {
    return typeof value === 'string' && value.trim().length > 0
  })

  return token || ''
}

const syncMockVerificationTokenFromGenerateLinkResult = (
  request,
  generateLinkResult
) => {
  if (!isMockVerificationHeaderEnabled(request)) {
    clearMockVerificationToken(request)
    return ''
  }

  const token = extractMockVerificationToken(generateLinkResult)

  if (!token) {
    clearMockVerificationToken(request)
    return ''
  }

  setMockVerificationToken(request, token)
  return token
}

const buildGenerateLinkMockEndpoint = (request) => {
  const notifyBaseUrl = config.get('notify.baseUrl')
  const emailGenerateLinkPath = config.get('notify.emailGenerateLinkPath')

  if (!notifyBaseUrl || !emailGenerateLinkPath) {
    return null
  }

  const { url } = buildBackendApiRequest(
    request,
    notifyBaseUrl,
    emailGenerateLinkPath
  )

  return url
}

const maybeApplyMockVerificationHeaders = (request, response) => {
  if (
    !isMockVerificationHeaderEnabled(request) ||
    typeof response?.header !== 'function'
  ) {
    return response
  }

  const token = getMockVerificationToken(request)

  if (!token) {
    return response
  }

  response.header(MOCK_VERIFICATION_TOKEN_HEADER, token)

  const generateLinkEndpoint = buildGenerateLinkMockEndpoint(request)
  if (generateLinkEndpoint) {
    response.header(MOCK_GENERATE_LINK_ENDPOINT_HEADER, generateLinkEndpoint)
  }

  return response
}

export {
  MOCK_VERIFICATION_TOKEN_HEADER,
  MOCK_GENERATE_LINK_ENDPOINT_HEADER,
  MOCK_EMAIL_VERIFICATION_TOKEN_SESSION_KEY,
  syncMockVerificationTokenFromGenerateLinkResult,
  maybeApplyMockVerificationHeaders
}
