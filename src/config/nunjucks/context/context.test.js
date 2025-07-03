import { vi } from 'vitest'

const mockReadFileSync = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('node:fs', async () => {
  const nodeFs = await import('node:fs')

  return {
    ...nodeFs,
    readFileSync: () => mockReadFileSync()
  }
})
vi.mock('../../../server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({ error: (...args) => mockLoggerError(...args) })
}))

/**
 * '' - Helper function to simulate manifest file read failure
 */
function simulateManifestReadFailure() {
  mockReadFileSync.mockImplementation(() => {
    throw new SyntaxError('Unexpected token in JSON')
  })
}

describe('context and cache', () => {
  beforeEach(() => {
    mockReadFileSync.mockReset()
    mockLoggerError.mockReset()
    vi.resetModules()
  })

  describe('#context', () => {
    const mockRequest = { path: '/' }

    describe('When webpack manifest file read succeeds', () => {
      let contextImport
      let contextResult

      beforeAll(async () => {
        contextImport = await import('./context.js')
      })

      beforeEach(() => {
        // Return JSON string
        mockReadFileSync.mockReturnValue(`{
        "application.js": "assets/javascripts/application.js",
        "application.scss": "assets/stylesheets/application.css"
      }`)

        contextResult = contextImport.context(mockRequest)
      })

      test('Should provide expected context', () => {
        expect(contextResult).toEqual({
          assetPath: '/public/assets',
          breadcrumbs: [],
          getAssetPath: expect.any(Function),
          navigation: [
            {
              current: true,
              text: 'Home',
              href: '/'
            },
            {
              current: false,
              text: 'About',
              href: '/about'
            }
          ],
          serviceName: 'aqie-front-end',
          serviceUrl: '/'
        })
      })
    })

    // '' - Flattened tests to avoid deep nesting
    describe('context.getAssetPath with valid asset path', () => {
      let contextImport
      let contextResult

      beforeAll(async () => {
        contextImport = await import('./context.js')
      })

      beforeEach(() => {
        mockReadFileSync.mockReturnValue(`{
        "application.js": "assets/javascripts/application.js",
        "application.scss": "assets/stylesheets/application.css"
      }`)
        contextResult = contextImport.context(mockRequest)
      })

      test('Should provide expected asset path', () => {
        expect(contextResult.getAssetPath('application.js')).toBe(
          '/public/assets/javascripts/application.js'
        )
      })
    })

    describe('context.getAssetPath with invalid asset path', () => {
      let contextImport
      let contextResult

      beforeAll(async () => {
        contextImport = await import('./context.js')
      })

      beforeEach(() => {
        mockReadFileSync.mockReturnValue(`{
        "application.js": "assets/javascripts/application.js",
        "application.scss": "assets/stylesheets/application.css"
      }`)
        contextResult = contextImport.context(mockRequest)
      })

      test('Should provide expected asset', () => {
        expect(contextResult.getAssetPath('an-image.png')).toBe(
          '/public/an-image.png'
        )
      })
    })

    describe('When manifest read fails', () => {
      let contextImport

      beforeAll(async () => {
        contextImport = await import('./context.js')
      })

      beforeEach(() => {
        simulateManifestReadFailure()
        contextImport.context(mockRequest)
      })

      test('Should log that the Webpack Manifest file is not available', () => {
        expect(mockLoggerError).toHaveBeenCalledWith(
          expect.stringContaining('Webpack assets-manifest.json not found'),
          expect.any(SyntaxError)
        )
      })
    })
  })

  describe('#context cache', () => {
    const mockRequest = { path: '/' }
    let contextResult

    describe('Webpack manifest file cache', () => {
      let contextImport

      beforeAll(async () => {
        contextImport = await import('./context.js')
      })

      beforeEach(() => {
        // Return JSON string
        mockReadFileSync.mockReturnValue(`{
        "application.js": "assets/javascripts/application.js",
        "application.scss": "assets/stylesheets/application.css"
      }`)

        contextResult = contextImport.context(mockRequest)
      })

      test('Should read file', () => {
        expect(mockReadFileSync).toHaveBeenCalled()
      })

      test('Should use cache', () => {
        expect(mockReadFileSync).not.toHaveBeenCalled()
      })

      test('Should provide expected context', () => {
        expect(contextResult).toEqual({
          assetPath: '/public/assets',
          breadcrumbs: [],
          getAssetPath: expect.any(Function),
          navigation: [
            {
              current: true,
              text: 'Home',
              href: '/'
            },
            {
              current: false,
              text: 'About',
              href: '/about'
            }
          ],
          serviceName: 'aqie-front-end',
          serviceUrl: '/'
        })
      })
    })
  })
})
