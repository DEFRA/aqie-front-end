// Mock data for testing
const mockResponseToolkit = {
  redirect: jest.fn(() => ({ code: jest.fn() }))
}

// Test redirectToWelshLocation
it('should redirect to Welsh location if conditions are met', () => {
  expect(mockResponseToolkit.redirect).toHaveBeenCalledWith(
    '/lleoliad/locationId/?lang=cy'
  )
})
