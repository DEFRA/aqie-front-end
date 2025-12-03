import { createWelshPollutantController } from './pollutant-controller-helper.js'
import { welsh } from '../../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  REDIRECT_STATUS_CODE
} from '../../../data/constants.js'

// '' Shared test data
const VIEW_TEMPLATE = 'sulphur-dioxide/index'
const mockH = {
  view: jest.fn(),
  redirect: jest.fn(() => ({ code: jest.fn() }))
}
const mockRequest = {
  query: {
    locationId: '123',
    locationName: 'Test Location'
  },
  path: '/llygryddion/sylffwr-deuocsid/cy'
}
const testConfig = {
  pollutantKey: 'sulphurDioxide',
  englishPath: '/pollutants/sulphur-dioxide',
  viewTemplate: VIEW_TEMPLATE,
  welshPathKey: 'sylffwr-deuocsid',
  pageIdentifier: 'Sulphur dioxide (SO₂)'
}

describe('createWelshPollutantController - Welsh content', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should create controller with Welsh content for Welsh path', () => {
    const controller = createWelshPollutantController(testConfig)
    controller.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      VIEW_TEMPLATE,
      expect.objectContaining({
        pageTitle: welsh.pollutants.sulphurDioxide.pageTitle,
        description: welsh.pollutants.sulphurDioxide.description,
        sulphurDioxide: welsh.pollutants.sulphurDioxide,
        page: 'Sulphur dioxide (SO₂)',
        displayBacklink: true,
        backLinkText: 'Llygredd aer yn Test Location',
        backLinkUrl: '/lleoliad/123?lang=cy',
        customBackLink: true,
        serviceName: welsh.multipleLocations.serviceName,
        lang: LANG_CY
      })
    )
  })
})

describe('createWelshPollutantController - redirects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should redirect to English when lang=en', () => {
    const requestWithEnglish = {
      ...mockRequest,
      query: { lang: LANG_EN }
    }

    const controller = createWelshPollutantController(testConfig)
    controller.handler(requestWithEnglish, mockH)

    expect(mockH.redirect).toHaveBeenCalledWith(
      '/pollutants/sulphur-dioxide?lang=en'
    )
    expect(mockH.redirect().code).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
  })
})

describe('createWelshPollutantController - default behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should default to Welsh for matching Welsh path', () => {
    const requestWithoutLang = {
      ...mockRequest,
      query: {}
    }

    const controller = createWelshPollutantController(testConfig)
    controller.handler(requestWithoutLang, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      VIEW_TEMPLATE,
      expect.objectContaining({
        lang: LANG_CY
      })
    )
  })
})

describe('createWelshPollutantController - different pollutants', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should handle different pollutant configurations', () => {
    const ozoneConfig = {
      pollutantKey: 'ozone',
      englishPath: '/pollutants/ozone',
      viewTemplate: 'ozone/index',
      welshPathKey: 'oson',
      pageIdentifier: 'ozone-cy'
    }

    const ozoneRequest = {
      query: {},
      path: '/llygryddion/oson/cy'
    }

    const controller = createWelshPollutantController(ozoneConfig)
    controller.handler(ozoneRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'ozone/index',
      expect.objectContaining({
        ozone: welsh.pollutants.ozone,
        page: 'ozone-cy'
      })
    )
  })
})
