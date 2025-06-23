import renderLocationNotFoundView from './renderLocationNotFoundView.js'
import { LOCATION_NOT_FOUND } from '~/src/server/data/constants'

// Mock data for testing
const mockResponseToolkit = {
  view: jest.fn(() => ({ code: jest.fn() })),
  response: jest.fn(() => ({ code: jest.fn() }))
}

const mockNotFoundLocation = {
  paragraphs: ['Paragraph 1', 'Paragraph 2'],
  heading: 'Not Found Heading'
}

const mockEnglish = {
  footerTxt: 'Footer Text',
  phaseBanner: 'Phase Banner',
  backlink: 'Backlink',
  cookieBanner: 'Cookie Banner'
}

// Test renderLocationNotFoundView
it('should render location not found view correctly', () => {
  const result = renderLocationNotFoundView(
    mockNotFoundLocation,
    mockEnglish,
    'en',
    mockResponseToolkit
  )
  expect(result).toEqual({ code: expect.any(Function) })
  expect(mockResponseToolkit.view).toHaveBeenCalledWith(
    LOCATION_NOT_FOUND,
    expect.objectContaining({
      paragraph: mockNotFoundLocation.paragraphs,
      serviceName: mockNotFoundLocation.heading,
      footerTxt: mockEnglish.footerTxt,
      phaseBanner: mockEnglish.phaseBanner,
      backlink: mockEnglish.backlink,
      cookieBanner: mockEnglish.cookieBanner,
      lang: 'en'
    })
  )
})
