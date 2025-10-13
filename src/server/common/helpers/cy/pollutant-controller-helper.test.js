import { createWelshPollutantController } from './pollutant-controller-helper.js'
import { welsh } from '../../../data/cy/cy.js'
import {
  LANG_CY,
  LANG_EN,
  REDIRECT_STATUS_CODE
} from '../../../data/constants.js'

describe('createWelshPollutantController', () => {
  const mockH = {
    view: jest.fn(),
    redirect: jest.fn(() => ({ code: jest.fn() }))
  }

  const mockRequest = {
    query: {},
    path: '/llygryddion/sylffwr-deuocsid/cy'
  }

  const testConfig = {
    pollutantKey: 'sulphurDioxide',
    englishPath: '/pollutants/sulphur-dioxide',
    viewTemplate: 'sulphur-dioxide/index',
    welshPathKey: 'sylffwr-deuocsid',
    pageIdentifier: 'Sulphur dioxide (SO₂)'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should create controller with Welsh content for Welsh path', () => {
    const controller = createWelshPollutantController(testConfig)
    const result = controller.handler(mockRequest, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'sulphur-dioxide/index',
      expect.objectContaining({
        pageTitle: welsh.pollutants.sulphurDioxide.pageTitle,
        description: welsh.pollutants.sulphurDioxide.description,
        sulphurDioxide: welsh.pollutants.sulphurDioxide,
        page: 'Sulphur dioxide (SO₂)',
        displayBacklink: false,
        serviceName: welsh.multipleLocations.serviceName,
        lang: LANG_CY
      })
    )
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

  test('should default to Welsh for matching Welsh path', () => {
    const requestWithoutLang = {
      ...mockRequest,
      query: {}
    }

    const controller = createWelshPollutantController(testConfig)
    controller.handler(requestWithoutLang, mockH)

    expect(mockH.view).toHaveBeenCalledWith(
      'sulphur-dioxide/index',
      expect.objectContaining({
        lang: LANG_CY
      })
    )
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
