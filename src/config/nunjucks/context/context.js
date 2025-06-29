import path from 'node:path'
import { readFileSync } from 'node:fs'

import { config } from '../../index.js'
import { buildNavigation } from './build-navigation.js'
import { createLogger } from '../../../server/common/helpers/logging/logger.js'

const logger = createLogger()
const assetPath = config.get('assetPath')
const manifestPath = path.join(
  config.get('root'),
  '.public/assets-manifest.json'
)

let webpackManifest

export function context(request) {
  if (!webpackManifest) {
    try {
      webpackManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch (error) {
      // Log the error details for debugging
      logger.error(
        `Webpack ${path.basename(manifestPath)} not found: ${error.message}`,
        error
      )
      webpackManifest = {} // Fallback to an empty object to avoid further errors
    }
  }

  return {
    assetPath: `${assetPath}/assets`,
    serviceName: config.get('serviceName'),
    serviceUrl: '/',
    breadcrumbs: [],
    navigation: buildNavigation(request),
    getAssetPath(asset) {
      const webpackAssetPath = webpackManifest?.[asset]
      const normalizedAssetPath =
        webpackAssetPath?.replace(/^\/public\/images\//, 'assets/images/') ??
        asset
      return `${assetPath}/${normalizedAssetPath}`
    }
  }
}
