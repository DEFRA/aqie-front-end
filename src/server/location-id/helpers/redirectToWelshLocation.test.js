import redirectToWelshLocation from './redirectToWelshLocation'

// Mock data for testing
const mockRequest = {
  query: { lang: 'cy' },
  params: { id: 'locationId' }
}

const mockResponseToolkit = {
  redirect: jest.fn(() => ({ code: jest.fn() }))
}

// Test redirectToWelshLocation
it('should redirect to Welsh location if conditions are met', () => {
  redirectToWelshLocation(
    mockRequest.query,
    mockRequest.params.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).toHaveBeenCalledWith(
    '/lleoliad/locationId/?lang=cy'
  )
})

// Test redirectToWelshLocation when conditions are not met
it('should not redirect if lang is not cy', () => {
  const mockRequestInvalidLang = {
    query: { lang: 'en' },
    params: { id: 'locationId' }
  }

  redirectToWelshLocation(
    mockRequestInvalidLang.query,
    mockRequestInvalidLang.params.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})

it('should not redirect if id is missing', () => {
  const mockRequestMissingId = {
    query: { lang: 'cy' },
    params: {}
  }

  redirectToWelshLocation(
    mockRequestMissingId.query,
    mockRequestMissingId.params.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})

it('should not redirect if query is undefined', () => {
  const mockRequestUndefinedQuery = {
    query: undefined,
    params: { id: 'locationId' }
  }

  redirectToWelshLocation(
    mockRequestUndefinedQuery.query,
    mockRequestUndefinedQuery.params.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})

it('should not redirect if params is undefined', () => {
  const mockRequestUndefinedParams = {
    query: { lang: 'cy' },
    params: undefined
  }

  redirectToWelshLocation(
    mockRequestUndefinedParams.query,
    mockRequestUndefinedParams.params?.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})

// Test when lang query parameter is missing
it('should not redirect if lang query parameter is missing', () => {
  const requestWithoutLang = {
    query: {},
    params: { id: 'locationId' }
  }

  redirectToWelshLocation(
    requestWithoutLang.query,
    requestWithoutLang.params.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})

// Test when id parameter is missing
it('should not redirect if id parameter is missing', () => {
  const requestWithoutId = {
    query: { lang: 'cy' },
    params: {}
  }

  redirectToWelshLocation(
    requestWithoutId.query,
    requestWithoutId.params.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})

// Test when lang query parameter is not "cy"
it('should not redirect if lang query parameter is not "cy"', () => {
  const requestWithDifferentLang = {
    query: { lang: 'en' },
    params: { id: 'locationId' }
  }

  redirectToWelshLocation(
    requestWithDifferentLang.query,
    requestWithDifferentLang.params.id,
    mockResponseToolkit
  )

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})

// Test redirect with invalid arguments
it('should handle invalid arguments gracefully', () => {
  redirectToWelshLocation(null, null, mockResponseToolkit)

  expect(mockResponseToolkit.redirect).not.toHaveBeenCalled()
})
